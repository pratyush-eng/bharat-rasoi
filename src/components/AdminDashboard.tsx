import React, { useState, useEffect } from 'react';
import { RecipeVideo, Category, RecipeBookBundle, DownloadLog, SiteSettings, AdminCredentials, Subscriber, PushNotification, PortalUpdate } from '../types';
import { extractYouTubeId, getYouTubeThumbnail } from '../utils/youtube';
import {
  saveRecipeToDb,
  deleteRecipeFromDb,
  saveCategoryToDb,
  deleteCategoryFromDb,
  saveCookbookToDb,
  deleteCookbookFromDb,
  saveSiteSettingsToDb,
  saveAdminCredentialsToDb,
  saveSubscriberToDb,
  deleteSubscriberFromDb,
  saveNotificationToDb,
  subscribePortalUpdates
} from '../lib/firebase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Palette,
  Video,
  FolderTree,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Download,
  Search,
  Sparkles,
  Loader2,
  Check,
  X,
  Eye,
  AlertCircle,
  AlertTriangle,
  Clock,
  Layers,
  ChefHat,
  Utensils,
  Flame,
  CookingPot,
  Award,
  Globe,
  Youtube,
  Instagram,
  Twitter,
  Mail,
  Lock,
  User,
  KeyRound,
  FileSpreadsheet,
  CheckCircle,
  Megaphone,
  PanelLeft,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Bell,
  Send,
  Users,
  UserPlus
} from 'lucide-react';

interface AdminDashboardProps {
  recipes: RecipeVideo[];
  setRecipes: React.Dispatch<React.SetStateAction<RecipeVideo[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  cookbooks: RecipeBookBundle[];
  setCookbooks: React.Dispatch<React.SetStateAction<RecipeBookBundle[]>>;
  downloadLogs: DownloadLog[];
  siteSettings: SiteSettings;
  setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  adminCredentials: AdminCredentials;
  setAdminCredentials: React.Dispatch<React.SetStateAction<AdminCredentials>>;
  subscribers?: Subscriber[];
  setSubscribers?: React.Dispatch<React.SetStateAction<Subscriber[]>>;
  notifications?: PushNotification[];
  setNotifications?: React.Dispatch<React.SetStateAction<PushNotification[]>>;
  onSendPushNotification?: (title: string, message: string, recipeId?: string, linkUrl?: string) => Promise<void> | void;
  onDeleteSubscriber?: (id: string) => Promise<void> | void;
  onAddSubscriber?: (email: string) => Promise<void> | void;
  onLogout: () => void;
  onOpenAiModal: () => void;
  isMobileSidebarOpen?: boolean;
  setIsMobileSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  recipes,
  setRecipes,
  categories,
  setCategories,
  cookbooks,
  setCookbooks,
  downloadLogs,
  siteSettings,
  setSiteSettings,
  adminCredentials,
  setAdminCredentials,
  subscribers = [],
  setSubscribers,
  notifications = [],
  setNotifications,
  onSendPushNotification,
  onDeleteSubscriber,
  onAddSubscriber,
  onLogout,
  onOpenAiModal,
  isMobileSidebarOpen: isMobileSidebarOpenProp,
  setIsMobileSidebarOpen: setIsMobileSidebarOpenProp
}) => {
  const [activeTab, setActiveTab] = useState<'branding' | 'videos' | 'categories' | 'cookbooks' | 'subscribers' | 'analytics' | 'security'>('branding');

  // Push Notifications & Subscriber Management Form State
  const [pushTitle, setPushTitle] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [pushRecipeId, setPushRecipeId] = useState('');
  const [pushCustomLink, setPushCustomLink] = useState('');
  const [isSendingPush, setIsSendingPush] = useState(false);

  const [subSearchQuery, setSubSearchQuery] = useState('');
  const [newSubEmailInput, setNewSubEmailInput] = useState('');
  const [isAddingSub, setIsAddingSub] = useState(false);

  // Internal state for mobile drawer if not passed from parent
  const [internalMobileSidebarOpen, setInternalMobileSidebarOpen] = useState(false);
  const isMobileOpen = isMobileSidebarOpenProp !== undefined ? isMobileSidebarOpenProp : internalMobileSidebarOpen;
  const setMobileOpen = (val: boolean) => {
    if (setIsMobileSidebarOpenProp) {
      setIsMobileSidebarOpenProp(val);
    } else {
      setInternalMobileSidebarOpen(val);
    }
  };

  // Success Notification state
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // -------------------------------------------------------------
  // BRANDING SETTINGS FORM STATE
  // -------------------------------------------------------------
  const [tempBranding, setTempBranding] = useState<SiteSettings>({ ...siteSettings });
  const [portalUpdates, setPortalUpdates] = useState<PortalUpdate[]>([]);

  useEffect(() => {
    setTempBranding({ ...siteSettings });
  }, [siteSettings]);

  useEffect(() => {
    const unsub = subscribePortalUpdates(setPortalUpdates);
    return () => unsub();
  }, []);

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSiteSettingsToDb(tempBranding, 'Admin Portal');
    showNotification('Website Branding & Customization Settings Saved Successfully to Portal Updates Table!');
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Logo file size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setTempBranding(prev => ({ ...prev, customLogoUrl: reader.result as string }));
        showNotification('Custom Logo Uploaded! Click "Save Changes" below to publish.');
      }
    };
    reader.readAsDataURL(file);
  };

  const presetColors = [
    { name: 'Electric Orange', hex: '#FF5F1F' },
    { name: 'Crimson Gourmet', hex: '#E11D48' },
    { name: 'Emerald Kitchen', hex: '#059669' },
    { name: 'Golden Amber', hex: '#D97706' },
    { name: 'Royal Bistro', hex: '#7C3AED' },
    { name: 'Ocean Culinary', hex: '#0284C7' },
  ];

  const logoOptions = [
    { id: 'ChefHat', label: 'Chef Hat', icon: ChefHat },
    { id: 'Utensils', label: 'Utensils', icon: Utensils },
    { id: 'Flame', label: 'Flame', icon: Flame },
    { id: 'Sparkles', label: 'Sparkles', icon: Sparkles },
    { id: 'CookingPot', label: 'Cooking Pot', icon: CookingPot },
    { id: 'Award', label: 'Award Badge', icon: Award },
  ];

  // -------------------------------------------------------------
  // VIDEOS MANAGER STATE
  // -------------------------------------------------------------
  const [videoSearchQuery, setVideoSearchQuery] = useState('');
  const [editingVideo, setEditingVideo] = useState<RecipeVideo | null>(null);
  const [isAddingVideo, setIsAddingVideo] = useState(false);

  // New Video Form State
  const [videoFormUrl, setVideoFormUrl] = useState('');
  const [videoFormTitle, setVideoFormTitle] = useState('');
  const [videoFormCategory, setVideoFormCategory] = useState(categories[0]?.id || '');
  const [videoFormDesc, setVideoFormDesc] = useState('');
  const [videoFormDuration, setVideoFormDuration] = useState('10:00');
  const [videoFormPrep, setVideoFormPrep] = useState('15 mins');
  const [videoFormCook, setVideoFormCook] = useState('20 mins');
  const [videoFormServings, setVideoFormServings] = useState(4);
  const [videoFormDifficulty, setVideoFormDifficulty] = useState<'Easy' | 'Medium' | 'Advanced'>('Medium');
  const [videoFormFeatured, setVideoFormFeatured] = useState(false);
  const [videoFormViewsCount, setVideoFormViewsCount] = useState<number>(125000);
  const [videoFormUploadDate, setVideoFormUploadDate] = useState<string>('');
  const [fetchingYtDetails, setFetchingYtDetails] = useState(false);
  const [isSyncingLiveYt, setIsSyncingLiveYt] = useState(false);

  const handleSyncAllVideosWithYouTube = async () => {
    if (!recipes || recipes.length === 0) return;
    setIsSyncingLiveYt(true);
    let updatedCount = 0;

    try {
      const updatedRecipesList = [...recipes];
      for (let i = 0; i < updatedRecipesList.length; i++) {
        const v = updatedRecipesList[i];
        if (v.youtubeUrl) {
          const res = await fetch('/api/youtube/details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: v.youtubeUrl })
          });
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            const details = await res.json();
            if (details.viewsCount || details.uploadDate) {
              const updatedVideo: RecipeVideo = {
                ...v,
                viewsCount: details.viewsCount || v.viewsCount,
                uploadDate: details.uploadDate || v.uploadDate
              };
              await saveRecipeToDb(updatedVideo);
              updatedRecipesList[i] = updatedVideo;
              updatedCount++;
            }
          }
        }
      }
      setRecipes(updatedRecipesList);
      showNotification(`Successfully synced live YouTube data for ${updatedCount} videos!`);
    } catch (err) {
      console.error('Failed to sync all videos with YouTube', err);
      showNotification('Failed to sync some video metrics.');
    } finally {
      setIsSyncingLiveYt(false);
    }
  };

  const resetVideoForm = () => {
    setVideoFormUrl('');
    setVideoFormTitle('');
    setVideoFormDesc('');
    setVideoFormDuration('10:00');
    setVideoFormPrep('15 mins');
    setVideoFormCook('20 mins');
    setVideoFormServings(4);
    setVideoFormDifficulty('Medium');
    setVideoFormFeatured(false);
    setVideoFormViewsCount(125000);
    setVideoFormUploadDate('');
    setEditingVideo(null);
  };

  const handleStartEditVideo = (v: RecipeVideo) => {
    setEditingVideo(v);
    setVideoFormUrl(v.youtubeUrl);
    setVideoFormTitle(v.title);
    setVideoFormCategory(v.categoryId);
    setVideoFormDesc(v.description);
    setVideoFormDuration(v.duration);
    setVideoFormPrep(v.prepTime);
    setVideoFormCook(v.cookTime);
    setVideoFormServings(v.servings);
    setVideoFormDifficulty(v.difficulty);
    setVideoFormFeatured(!!v.featured);
    setVideoFormViewsCount(v.viewsCount || 125000);
    setVideoFormUploadDate(v.uploadDate || '');
    setIsAddingVideo(true);
  };

  const handleAutoFetchYtDetails = async (inputUrl?: string) => {
    const targetUrl = inputUrl || videoFormUrl;
    if (!targetUrl) return;

    setFetchingYtDetails(true);
    try {
      const res = await fetch('/api/youtube/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const details = await res.json();
        if (details.title) {
          setVideoFormTitle(details.title);
        }
        if (details.description) {
          setVideoFormDesc(details.description);
        }
        if (details.viewsCount) {
          setVideoFormViewsCount(details.viewsCount);
        }
        if (details.uploadDate) {
          setVideoFormUploadDate(details.uploadDate);
        }
        showNotification('YouTube video details auto-extracted!');
      } else {
        // Direct browser oEmbed fallback
        const videoId = extractYouTubeId(targetUrl);
        if (videoId) {
          fetch(`https://noembed.com/embed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`)
            .then(r => r.json())
            .then(data => {
              if (data.title) setVideoFormTitle(data.title);
              showNotification('Video title extracted from YouTube!');
            })
            .catch(() => {});
        }
      }
    } catch (err) {
      console.error('Failed to auto-fetch YouTube details', err);
    } finally {
      setFetchingYtDetails(false);
    }
  };

  const handleSaveVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFormTitle || !videoFormUrl) return;

    const videoId = extractYouTubeId(videoFormUrl);
    const catObj = categories.find(c => c.id === videoFormCategory);
    const formattedUploadDate = videoFormUploadDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (editingVideo) {
      // Update existing video
      const updatedVideo: RecipeVideo = {
        ...editingVideo,
        title: videoFormTitle,
        description: videoFormDesc || editingVideo.description,
        youtubeUrl: videoFormUrl,
        youtubeVideoId: videoId,
        categoryId: videoFormCategory,
        categoryName: catObj?.name || editingVideo.categoryName,
        thumbnailUrl: getYouTubeThumbnail(videoId),
        duration: videoFormDuration,
        prepTime: videoFormPrep,
        cookTime: videoFormCook,
        servings: videoFormServings,
        difficulty: videoFormDifficulty,
        featured: videoFormFeatured,
        viewsCount: videoFormViewsCount,
        uploadDate: formattedUploadDate
      };
      await saveRecipeToDb(updatedVideo);
      showNotification(`Video "${videoFormTitle}" Updated!`);
    } else {
      // Create new video
      const videoObj: RecipeVideo = {
        id: `rec-${Date.now()}`,
        title: videoFormTitle,
        description: videoFormDesc || 'Fresh YouTube cooking tutorial.',
        youtubeUrl: videoFormUrl,
        youtubeVideoId: videoId,
        categoryId: videoFormCategory,
        categoryName: catObj?.name || 'General Cooking',
        thumbnailUrl: getYouTubeThumbnail(videoId),
        duration: videoFormDuration,
        difficulty: videoFormDifficulty,
        prepTime: videoFormPrep,
        cookTime: videoFormCook,
        servings: videoFormServings,
        tags: ['Cooking', 'Recipe', catObj?.name || 'Tutorial'],
        rating: 5.0,
        viewsCount: videoFormViewsCount,
        uploadDate: formattedUploadDate,
        downloadsCount: 15,
        featured: videoFormFeatured,
        createdAt: new Date().toISOString().split('T')[0],
        ingredients: [
          { id: 'i101', name: 'Primary Ingredient', amount: '200g', category: 'Produce' },
          { id: 'i102', name: 'Seasoning & Oils', amount: '1 tbsp', category: 'Pantry & Spices' }
        ],
        steps: [
          { stepNumber: 1, timestampSeconds: 0, title: 'Preparation', instruction: 'Slice and measure all ingredients.' },
          { stepNumber: 2, timestampSeconds: 60, title: 'Cook', instruction: 'Follow step-by-step stove instructions.' }
        ]
      };

      await saveRecipeToDb(videoObj);
      showNotification(`New Video "${videoFormTitle}" Created!`);
    }

    setIsAddingVideo(false);
    resetVideoForm();
  };

  // Delete Confirmation Modal State
  const [deleteItemModal, setDeleteItemModal] = useState<{
    id: string;
    title: string;
    type: 'category' | 'video' | 'cookbook';
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteVideo = (id: string, title: string) => {
    setDeleteItemModal({ id, title, type: 'video' });
  };

  const handleDeleteCategory = (id: string, title: string) => {
    setDeleteItemModal({ id, title, type: 'category' });
  };

  const handleDeleteCookbook = (id: string, title: string) => {
    setDeleteItemModal({ id, title, type: 'cookbook' });
  };

  const handleConfirmDelete = async () => {
    if (!deleteItemModal) return;
    setIsDeleting(true);
    try {
      if (deleteItemModal.type === 'category') {
        await deleteCategoryFromDb(deleteItemModal.id);
        if (editingCategory?.id === deleteItemModal.id) {
          handleResetCategoryForm();
        }
        showNotification(`Category "${deleteItemModal.title}" Removed.`);
      } else if (deleteItemModal.type === 'video') {
        await deleteRecipeFromDb(deleteItemModal.id);
        showNotification(`Video Tutorial "${deleteItemModal.title}" Removed.`);
      } else if (deleteItemModal.type === 'cookbook') {
        await deleteCookbookFromDb(deleteItemModal.id);
        showNotification(`Cookbook Bundle "${deleteItemModal.title}" Removed.`);
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
    } finally {
      setIsDeleting(false);
      setDeleteItemModal(null);
    }
  };

  // -------------------------------------------------------------
  // CATEGORIES MANAGER STATE
  // -------------------------------------------------------------
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('UtensilsCrossed');

  const handleStartEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setNewCatName(cat.name);
    setNewCatDesc(cat.description);
    setNewCatIcon(cat.icon || 'UtensilsCrossed');
    setIsAddingCategory(true);
  };

  const handleResetCategoryForm = () => {
    setEditingCategory(null);
    setNewCatName('');
    setNewCatDesc('');
    setNewCatIcon('UtensilsCrossed');
    setIsAddingCategory(false);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    if (editingCategory) {
      // Update existing category in Firestore
      const updatedCat: Category = {
        ...editingCategory,
        name: newCatName,
        slug: newCatName.toLowerCase().replace(/\s+/g, '-'),
        description: newCatDesc || 'Custom recipe collection.',
        icon: newCatIcon
      };
      await saveCategoryToDb(updatedCat);

      // Also update recipe category names for recipes in this category
      const affectedRecipes = recipes.filter(r => r.categoryId === editingCategory.id);
      for (const r of affectedRecipes) {
        await saveRecipeToDb({
          ...r,
          categoryName: newCatName
        });
      }

      showNotification(`Category "${newCatName}" Updated!`);
    } else {
      // Create new category in Firestore
      const catObj: Category = {
        id: `cat-${Date.now()}`,
        name: newCatName,
        slug: newCatName.toLowerCase().replace(/\s+/g, '-'),
        description: newCatDesc || 'Custom recipe collection.',
        icon: newCatIcon,
        color: 'from-orange-500 to-amber-600',
        videoCount: 0
      };

      await saveCategoryToDb(catObj);
      showNotification(`New Category "${newCatName}" Added!`);
    }

    handleResetCategoryForm();
  };

  // -------------------------------------------------------------
  // COOKBOOKS BUNDLE MANAGER STATE
  // -------------------------------------------------------------
  const [isAddingCookbook, setIsAddingCookbook] = useState(false);
  const [bookTitle, setBookTitle] = useState('');
  const [bookDesc, setBookDesc] = useState('');
  const [bookCategory, setBookCategory] = useState('Master Class');
  const [bookCoverUrl, setBookCoverUrl] = useState('');

  const handleSaveCookbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle) return;

    const newBundle: RecipeBookBundle = {
      id: `book-${Date.now()}`,
      title: bookTitle,
      description: bookDesc || 'Exclusive downloadable PDF cookbook bundle.',
      coverImageUrl: bookCoverUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      category: bookCategory,
      downloadCount: 0,
      recipeIds: recipes.slice(0, 3).map(r => r.id)
    };

    await saveCookbookToDb(newBundle);
    setIsAddingCookbook(false);
    setBookTitle('');
    setBookDesc('');
    setBookCoverUrl('');
    showNotification(`New Cookbook Bundle "${bookTitle}" Created!`);
  };

  // -------------------------------------------------------------
  // ANALYTICS & LOGS STATE
  // -------------------------------------------------------------
  const [logSearchQuery, setLogSearchQuery] = useState('');

  const filteredLogs = downloadLogs.filter(log =>
    log.itemName.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
    log.location.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
    log.device.toLowerCase().includes(logSearchQuery.toLowerCase())
  );

  const exportLogsCsv = () => {
    const headers = 'ID,Timestamp,Item Type,Item Name,Device,Location\n';
    const rows = downloadLogs.map(l => `"${l.id}","${l.timestamp}","${l.itemType}","${l.itemName.replace(/"/g, '""')}","${l.device}","${l.location}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chef_studio_download_audit_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Recharts Data
  const weeklyData = [
    { day: 'Mon', downloads: 140, views: 2400 },
    { day: 'Tue', downloads: 210, views: 3100 },
    { day: 'Wed', downloads: 180, views: 2900 },
    { day: 'Thu', downloads: 290, views: 4200 },
    { day: 'Fri', downloads: 350, views: 5100 },
    { day: 'Sat', downloads: 480, views: 6800 },
    { day: 'Sun', downloads: 520, views: 7400 },
  ];

  const deviceData = [
    { name: 'Mobile', value: 58, color: '#FF5F1F' },
    { name: 'Desktop', value: 32, color: '#1A1A1A' },
    { name: 'Tablet', value: 10, color: '#059669' }
  ];

  // -------------------------------------------------------------
  // SECURITY & CREDENTIALS STATE
  // -------------------------------------------------------------
  const [newUsernameInput, setNewUsernameInput] = useState(adminCredentials.username);
  const [newPasswordInput, setNewPasswordInput] = useState(adminCredentials.password);

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsernameInput || !newPasswordInput) return;
    const credsObj = {
      username: newUsernameInput,
      password: newPasswordInput
    };
    await saveAdminCredentialsToDb(credsObj);
    showNotification('Admin Credentials Updated Successfully!');
  };

  return (
    <div className="py-8 space-y-6">
      
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-24 right-6 z-50 bg-[#1A1A1A] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#FF5F1F] flex items-center gap-3 animate-slideIn">
          <CheckCircle className="w-5 h-5 text-[#FF5F1F]" />
          <span className="text-xs font-bold">{saveToast}</span>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="bg-[#1A1A1A] rounded-3xl p-6 sm:p-8 text-white flex flex-wrap items-center justify-between gap-4 shadow-xl border border-[#2A2A2A]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#FF5F1F] text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Authenticated Control Center
            </span>
            <span className="text-gray-400 text-xs">LoggedIn as <strong className="text-white">{adminCredentials.username}</strong></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Chef Studio Admin Control</h1>
          <p className="text-xs text-gray-300 mt-1">Manage website branding, video tutorials, categories, cookbooks, & analytics.</p>
        </div>

        <button
          onClick={onLogout}
          className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/20 px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Admin Logout
        </button>
      </div>

      {/* MOBILE QUICK ACTION SIDE PANEL TRIGGER BAR */}
      <div className="lg:hidden flex items-center justify-between bg-white border border-[#E5E5E1] rounded-2xl p-3.5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-gray-500">Section:</span>
          <span className="text-xs font-black text-[#1A1A1A] bg-[#F3F3F1] border border-[#E5E5E1] px-3 py-1 rounded-full capitalize flex items-center gap-1.5">
            {activeTab === 'branding' && <><Palette className="w-3.5 h-3.5 text-[#FF5F1F]" /> Site Branding</>}
            {activeTab === 'videos' && <><Video className="w-3.5 h-3.5 text-[#FF5F1F]" /> Videos ({recipes.length})</>}
            {activeTab === 'categories' && <><FolderTree className="w-3.5 h-3.5 text-[#FF5F1F]" /> Categories ({categories.length})</>}
            {activeTab === 'cookbooks' && <><BookOpen className="w-3.5 h-3.5 text-[#FF5F1F]" /> Cookbooks ({cookbooks.length})</>}
            {activeTab === 'analytics' && <><TrendingUp className="w-3.5 h-3.5 text-[#FF5F1F]" /> Analytics</>}
            {activeTab === 'security' && <><Lock className="w-3.5 h-3.5 text-[#FF5F1F]" /> Security</>}
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="bg-[#1A1A1A] hover:bg-[#FF5F1F] text-white text-xs font-extrabold px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95"
        >
          <PanelLeft className="w-4 h-4 text-[#FF5F1F]" />
          <span>Open Side Panel</span>
        </button>
      </div>

      {/* MOBILE SLIDE-OVER DRAWER SIDE PANEL */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Blur */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between p-5 overflow-y-auto z-10 border-r border-[#E5E5E1] animate-slideRight">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E1]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#1A1A1A] text-white flex items-center justify-center shadow-md">
                    <ShieldCheck className="w-5 h-5 text-[#FF5F1F]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-[#1A1A1A]">Admin Navigation</h2>
                    <p className="text-[10px] text-gray-400 font-bold">Select Dashboard Section</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-gray-400 hover:text-[#1A1A1A] rounded-full hover:bg-[#F3F3F1] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Side Panel Nav Buttons */}
              <div className="px-1 py-1 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                Admin Customization Sections
              </div>

              <nav className="space-y-1.5">
                <button
                  onClick={() => { setActiveTab('branding'); setMobileOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-between ${
                    activeTab === 'branding'
                      ? 'bg-[#1A1A1A] text-white shadow-md'
                      : 'text-gray-700 hover:bg-[#F3F3F1] hover:text-[#1A1A1A]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Palette className="w-4 h-4 text-[#FF5F1F]" /> Site Branding & Identity
                  </span>
                  {activeTab === 'branding' && <span className="w-2 h-2 rounded-full bg-[#FF5F1F]" />}
                </button>

                <button
                  onClick={() => { setActiveTab('videos'); setMobileOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-between ${
                    activeTab === 'videos'
                      ? 'bg-[#1A1A1A] text-white shadow-md'
                      : 'text-gray-700 hover:bg-[#F3F3F1] hover:text-[#1A1A1A]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Video className="w-4 h-4 text-[#FF5F1F]" /> Video Tutorials ({recipes.length})
                  </span>
                  {activeTab === 'videos' && <span className="w-2 h-2 rounded-full bg-[#FF5F1F]" />}
                </button>

                <button
                  onClick={() => { setActiveTab('categories'); setMobileOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-between ${
                    activeTab === 'categories'
                      ? 'bg-[#1A1A1A] text-white shadow-md'
                      : 'text-gray-700 hover:bg-[#F3F3F1] hover:text-[#1A1A1A]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <FolderTree className="w-4 h-4 text-[#FF5F1F]" /> Categories ({categories.length})
                  </span>
                  {activeTab === 'categories' && <span className="w-2 h-2 rounded-full bg-[#FF5F1F]" />}
                </button>

                <button
                  onClick={() => { setActiveTab('cookbooks'); setMobileOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-between ${
                    activeTab === 'cookbooks'
                      ? 'bg-[#1A1A1A] text-white shadow-md'
                      : 'text-gray-700 hover:bg-[#F3F3F1] hover:text-[#1A1A1A]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-[#FF5F1F]" /> Digital Cookbooks ({cookbooks.length})
                  </span>
                  {activeTab === 'cookbooks' && <span className="w-2 h-2 rounded-full bg-[#FF5F1F]" />}
                </button>

                <button
                  onClick={() => { setActiveTab('analytics'); setMobileOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-between ${
                    activeTab === 'analytics'
                      ? 'bg-[#1A1A1A] text-white shadow-md'
                      : 'text-gray-700 hover:bg-[#F3F3F1] hover:text-[#1A1A1A]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4 text-[#FF5F1F]" /> Download Analytics
                  </span>
                  {activeTab === 'analytics' && <span className="w-2 h-2 rounded-full bg-[#FF5F1F]" />}
                </button>

                <button
                  onClick={() => { setActiveTab('security'); setMobileOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-between ${
                    activeTab === 'security'
                      ? 'bg-[#1A1A1A] text-white shadow-md'
                      : 'text-gray-700 hover:bg-[#F3F3F1] hover:text-[#1A1A1A]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-[#FF5F1F]" /> Security & Credentials
                  </span>
                  {activeTab === 'security' && <span className="w-2 h-2 rounded-full bg-[#FF5F1F]" />}
                </button>
              </nav>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-[#E5E5E1] space-y-2">
              <button
                onClick={() => { setMobileOpen(false); onOpenAiModal(); }}
                className="w-full bg-[#FF5F1F] text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-[#1A1A1A] transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                AI Recipe Extractor
              </button>

              <button
                onClick={() => { setMobileOpen(false); onLogout(); }}
                className="w-full bg-red-50 text-red-600 hover:bg-red-100 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-red-200"
              >
                <LogOut className="w-4 h-4" />
                Admin Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN LAYOUT WITH SIDE PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SIDE PANEL NAVIGATION (3 Cols on Desktop) */}
        <aside className="hidden lg:block lg:col-span-3 bg-white border border-[#E5E5E1] rounded-3xl p-4 shadow-sm space-y-2 sticky top-24">
          <div className="px-3 py-2 text-[10px] font-black uppercase text-gray-400 tracking-wider">
            Admin Customization Panel
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('branding')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-between ${
                activeTab === 'branding'
                  ? 'bg-[#1A1A1A] text-white shadow-md'
                  : 'text-gray-700 hover:bg-[#F3F3F1] hover:text-[#1A1A1A]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Palette className="w-4 h-4 text-[#FF5F1F]" /> Site Branding & Identity
              </span>
              {activeTab === 'branding' && <span className="w-2 h-2 rounded-full bg-[#FF5F1F]" />}
            </button>

            <button
              onClick={() => setActiveTab('videos')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-between ${
                activeTab === 'videos'
                  ? 'bg-[#1A1A1A] text-white shadow-md'
                  : 'text-gray-700 hover:bg-[#F3F3F1] hover:text-[#1A1A1A]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Video className="w-4 h-4 text-[#FF5F1F]" /> Video Tutorials ({recipes.length})
              </span>
              {activeTab === 'videos' && <span className="w-2 h-2 rounded-full bg-[#FF5F1F]" />}
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-between ${
                activeTab === 'categories'
                  ? 'bg-[#1A1A1A] text-white shadow-md'
                  : 'text-gray-700 hover:bg-[#F3F3F1] hover:text-[#1A1A1A]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FolderTree className="w-4 h-4 text-[#FF5F1F]" /> Categories ({categories.length})
              </span>
              {activeTab === 'categories' && <span className="w-2 h-2 rounded-full bg-[#FF5F1F]" />}
            </button>

            <button
              onClick={() => setActiveTab('cookbooks')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-between ${
                activeTab === 'cookbooks'
                  ? 'bg-[#1A1A1A] text-white shadow-md'
                  : 'text-gray-700 hover:bg-[#F3F3F1] hover:text-[#1A1A1A]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-[#FF5F1F]" /> Digital Cookbooks ({cookbooks.length})
              </span>
              {activeTab === 'cookbooks' && <span className="w-2 h-2 rounded-full bg-[#FF5F1F]" />}
            </button>

            <button
              onClick={() => setActiveTab('subscribers')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-between ${
                activeTab === 'subscribers'
                  ? 'bg-[#1A1A1A] text-white shadow-md'
                  : 'text-gray-700 hover:bg-[#F3F3F1] hover:text-[#1A1A1A]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-[#FF5F1F]" /> Subscribers & Notifications ({subscribers.length})
              </span>
              {activeTab === 'subscribers' && <span className="w-2 h-2 rounded-full bg-[#FF5F1F]" />}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-between ${
                activeTab === 'analytics'
                  ? 'bg-[#1A1A1A] text-white shadow-md'
                  : 'text-gray-700 hover:bg-[#F3F3F1] hover:text-[#1A1A1A]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-[#FF5F1F]" /> Download Analytics
              </span>
              {activeTab === 'analytics' && <span className="w-2 h-2 rounded-full bg-[#FF5F1F]" />}
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-between ${
                activeTab === 'security'
                  ? 'bg-[#1A1A1A] text-white shadow-md'
                  : 'text-gray-700 hover:bg-[#F3F3F1] hover:text-[#1A1A1A]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-[#FF5F1F]" /> Security & Credentials
              </span>
              {activeTab === 'security' && <span className="w-2 h-2 rounded-full bg-[#FF5F1F]" />}
            </button>
          </nav>

          <div className="pt-4 border-t border-[#E5E5E1]">
            <div className="bg-[#FAF9F6] border border-[#E5E5E1] p-3 rounded-2xl text-[11px] space-y-1">
              <span className="font-extrabold text-[#1A1A1A] block">Quick AI Assistant</span>
              <p className="text-gray-500">Extract new recipes automatically using Gemini AI</p>
              <button
                onClick={onOpenAiModal}
                className="w-full mt-1.5 py-2 bg-[#FF5F1F] text-white font-bold rounded-full text-[10px] flex items-center justify-center gap-1 shadow-sm hover:scale-105 transition-transform"
              >
                <Sparkles className="w-3 h-3" /> Gemini AI Recipe Extractor
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN PANEL CONTENT (9 Cols) */}
        <main className="lg:col-span-9 bg-white border border-[#E5E5E1] rounded-3xl p-6 sm:p-8 shadow-sm">
          
          {/* TAB 1: SITE BRANDING & CUSTOMIZATION */}
          {activeTab === 'branding' && (
            <div className="space-y-8">
              <div>
                <span className="bg-[#FF5F1F]/10 text-[#FF5F1F] border border-[#FF5F1F]/20 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-1">
                  Full Website Customizer
                </span>
                <h2 className="text-xl font-extrabold text-[#1A1A1A]">Site Branding & Identity Settings</h2>
                <p className="text-xs text-gray-500 mt-1">Customize your website name, logo icon, primary theme accent color, announcement banner, and social media links in real-time.</p>
              </div>

              <form onSubmit={handleSaveBranding} className="space-y-6">
                
                {/* 1. Logo & Site Name Section */}
                <div className="bg-[#FAF9F6] border border-[#E5E5E1] p-6 rounded-3xl space-y-6">
                  <h3 className="text-sm font-extrabold text-[#1A1A1A] flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#FF5F1F]" /> Website Title, Tagline & Custom Logo
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-[#1A1A1A]">Website Name / Title</label>
                      <input
                        type="text"
                        required
                        value={tempBranding.siteName}
                        onChange={(e) => setTempBranding({ ...tempBranding, siteName: e.target.value })}
                        placeholder="e.g. CHEF STUDIO"
                        className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-4 py-2.5 text-xs text-[#1A1A1A] font-bold focus:outline-none focus:border-[#FF5F1F]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-[#1A1A1A]">Tagline / Subtitle</label>
                      <input
                        type="text"
                        value={tempBranding.tagline}
                        onChange={(e) => setTempBranding({ ...tempBranding, tagline: e.target.value })}
                        placeholder="e.g. Cooking Tutorials & Printable Recipe Books"
                        className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5F1F]"
                      />
                    </div>
                  </div>

                  {/* Logo Upload & Preview Box */}
                  <div className="pt-4 border-t border-[#E5E5E1] space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-extrabold text-[#1A1A1A] flex items-center gap-2">
                          <Upload className="w-4 h-4 text-[#FF5F1F]" /> Upload Custom Website Logo
                        </h4>
                        <p className="text-[11px] text-gray-500">Upload your brand logo image (PNG, SVG, WEBP, JPG) or enter an image URL.</p>
                      </div>

                      {tempBranding.customLogoUrl && (
                        <button
                          type="button"
                          onClick={() => setTempBranding({ ...tempBranding, customLogoUrl: '' })}
                          className="text-[11px] text-red-500 hover:text-red-600 font-bold hover:underline flex items-center gap-1.5 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Custom Logo</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-white border border-[#E5E5E1] rounded-2xl p-4">
                      {/* Logo Header Preview */}
                      <div className="md:col-span-4 flex flex-col items-center justify-center p-3.5 bg-[#FAF9F6] border border-[#E5E5E1] rounded-xl text-center space-y-2">
                        <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Header Logo Preview</span>
                        
                        <div className="flex items-center gap-3 bg-white p-2.5 px-3.5 rounded-xl border border-[#E5E5E1] shadow-sm max-w-full">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md overflow-hidden bg-white shrink-0 border border-gray-100"
                            style={{ backgroundColor: tempBranding.customLogoUrl ? '#FFFFFF' : (tempBranding.accentColor || '#FF5F1F') }}
                          >
                            {tempBranding.customLogoUrl ? (
                              <img
                                src={tempBranding.customLogoUrl}
                                alt="Logo Preview"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-contain p-0.5"
                              />
                            ) : (
                              (() => {
                                const IconComp = logoOptions.find(o => o.id === tempBranding.logoIcon)?.icon || ChefHat;
                                return <IconComp className="w-6 h-6 text-white" />;
                              })()
                            )}
                          </div>
                          <div className="text-left overflow-hidden">
                            <span className="font-extrabold text-sm text-[#1A1A1A] block leading-tight truncate">
                              {tempBranding.siteName || 'CHEF STUDIO'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium block truncate">Header Title</span>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-[#FF5F1F]">
                          {tempBranding.customLogoUrl ? '✨ Custom Image Active' : `Default Icon (${tempBranding.logoIcon})`}
                        </span>
                      </div>

                      {/* Upload Input Controls */}
                      <div className="md:col-span-8 space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5">
                            Option A: Select Image File from Device
                          </label>
                          <label className="flex items-center justify-center gap-2.5 w-full bg-[#FAF9F6] hover:bg-[#F3F3F1] border-2 border-dashed border-[#E5E5E1] hover:border-[#FF5F1F] rounded-2xl p-3.5 cursor-pointer transition-all text-xs font-bold text-[#1A1A1A] group">
                            <Upload className="w-4 h-4 text-[#FF5F1F] group-hover:scale-110 transition-transform" />
                            <span>Click to Browse & Upload Image File (PNG, SVG, JPG - Max 5MB)</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                            Option B: Or Enter Image URL
                          </label>
                          <div className="relative">
                            <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="url"
                              value={tempBranding.customLogoUrl || ''}
                              onChange={(e) => setTempBranding({ ...tempBranding, customLogoUrl: e.target.value })}
                              placeholder="https://example.com/my-logo.png"
                              className="w-full bg-[#FAF9F6] border border-[#E5E5E1] rounded-xl pl-10 pr-4 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5F1F] font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fallback Vector Logo Icon Choice */}
                  <div className="space-y-2 pt-3 border-t border-[#E5E5E1]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-[#1A1A1A]">
                        Default Icon (Used if no custom logo image uploaded)
                      </label>
                      {tempBranding.customLogoUrl && (
                        <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          Custom logo image overrides this icon
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {logoOptions.map((opt) => {
                        const IconComp = opt.icon;
                        const isSel = tempBranding.logoIcon === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setTempBranding({ ...tempBranding, logoIcon: opt.id })}
                            className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                              isSel
                                ? 'bg-[#FF5F1F] text-white border-[#FF5F1F] shadow-md'
                                : 'bg-white text-gray-700 border-[#E5E5E1] hover:border-[#FF5F1F]'
                            }`}
                          >
                            <IconComp className="w-5 h-5" />
                            <span className="text-[10px] font-bold">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. Theme Accent Color */}
                <div className="bg-[#FAF9F6] border border-[#E5E5E1] p-6 rounded-3xl space-y-4">
                  <h3 className="text-sm font-extrabold text-[#1A1A1A] flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#FF5F1F]" /> Primary Brand Color Accent
                  </h3>

                  <div className="flex flex-wrap items-center gap-3">
                    {presetColors.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setTempBranding({ ...tempBranding, accentColor: c.hex })}
                        className={`px-3 py-2 rounded-full text-xs font-extrabold flex items-center gap-2 border transition-all ${
                          tempBranding.accentColor === c.hex
                            ? 'border-[#1A1A1A] ring-2 ring-offset-2 ring-[#FF5F1F] scale-105'
                            : 'border-[#E5E5E1] bg-white'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: c.hex }} />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <label className="text-xs font-bold text-gray-600">Custom Hex Color:</label>
                    <input
                      type="color"
                      value={tempBranding.accentColor}
                      onChange={(e) => setTempBranding({ ...tempBranding, accentColor: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-[#E5E5E1]"
                    />
                    <span className="font-mono text-xs font-bold bg-white px-3 py-1.5 rounded-xl border border-[#E5E5E1]">
                      {tempBranding.accentColor}
                    </span>
                  </div>
                </div>

                {/* 3. Top Announcement Banner */}
                <div className="bg-[#FAF9F6] border border-[#E5E5E1] p-6 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-[#1A1A1A] flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-[#FF5F1F]" /> Top Announcement Bar
                    </h3>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1A1A1A]">
                      <input
                        type="checkbox"
                        checked={tempBranding.showAnnouncement}
                        onChange={(e) => setTempBranding({ ...tempBranding, showAnnouncement: e.target.checked })}
                        className="rounded border-gray-300 text-[#FF5F1F] focus:ring-[#FF5F1F]"
                      />
                      Enable Announcement Banner
                    </label>
                  </div>

                  {tempBranding.showAnnouncement && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-[#1A1A1A]">Banner Text Message</label>
                      <input
                        type="text"
                        value={tempBranding.announcementText}
                        onChange={(e) => setTempBranding({ ...tempBranding, announcementText: e.target.value })}
                        placeholder="🔥 New PDF Cookbooks Available!"
                        className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5F1F]"
                      />
                    </div>
                  )}
                </div>

                {/* 4. Hero Banner Auto-Slide Settings */}
                <div className="bg-[#FAF9F6] border border-[#E5E5E1] p-6 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-[#1A1A1A] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand-accent" /> Hero Banner Auto-Slide Settings
                    </h3>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1A1A1A]">
                      <input
                        type="checkbox"
                        checked={tempBranding.heroAutoSlideEnabled !== false}
                        onChange={(e) => setTempBranding({ ...tempBranding, heroAutoSlideEnabled: e.target.checked })}
                        className="rounded border-gray-300 text-brand-accent focus:ring-brand-accent"
                      />
                      Enable Auto-Slide (Top 10 Uploads)
                    </label>
                  </div>

                  {tempBranding.heroAutoSlideEnabled !== false && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                      <div className="space-y-1.5">
                        <label className="font-bold text-[#1A1A1A]">Auto-Slide Speed (Interval)</label>
                        <select
                          value={tempBranding.heroAutoSlideSpeed || 4500}
                          onChange={(e) => setTempBranding({ ...tempBranding, heroAutoSlideSpeed: Number(e.target.value) })}
                          className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-brand-accent"
                        >
                          <option value={3000}>⚡ 3.0 Seconds (Fast)</option>
                          <option value={4500}>⏱️ 4.5 Seconds (Recommended)</option>
                          <option value={6000}>🐢 6.0 Seconds (Relaxed)</option>
                          <option value={8000}>🛋️ 8.0 Seconds (Slow)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-[#1A1A1A]">Slide Scroll Direction</label>
                        <select
                          value={tempBranding.heroSlideDirection || 'right-to-left'}
                          onChange={(e) => setTempBranding({ ...tempBranding, heroSlideDirection: e.target.value as 'right-to-left' | 'left-to-right' })}
                          className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-brand-accent"
                        >
                          <option value="right-to-left">➡️ Right-to-Left Scroll (Standard)</option>
                          <option value="left-to-right">⬅️ Left-to-Right Scroll</option>
                        </select>
                      </div>
                    </div>
                  )}
                  <p className="text-[11px] text-gray-500 font-medium">
                    Automatically scrolls horizontally through the top 10 uploaded recipes & featured tutorial banner on the homepage.
                  </p>
                </div>

                {/* 4. Social Links & Contact */}
                <div className="bg-[#FAF9F6] border border-[#E5E5E1] p-6 rounded-3xl space-y-4">
                  <h3 className="text-sm font-extrabold text-[#1A1A1A] flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-red-500" /> Channel Social Links & Contact
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-[#1A1A1A] flex items-center gap-1.5">
                        <Youtube className="w-3.5 h-3.5 text-red-500" /> YouTube Channel URL
                      </label>
                      <input
                        type="url"
                        value={tempBranding.youtubeUrl}
                        onChange={(e) => setTempBranding({ ...tempBranding, youtubeUrl: e.target.value })}
                        className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#FF5F1F]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[#1A1A1A] flex items-center gap-1.5">
                        <Instagram className="w-3.5 h-3.5 text-pink-500" /> Instagram Profile URL
                      </label>
                      <input
                        type="url"
                        value={tempBranding.instagramUrl}
                        onChange={(e) => setTempBranding({ ...tempBranding, instagramUrl: e.target.value })}
                        className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#FF5F1F]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[#1A1A1A] flex items-center gap-1.5">
                        <Twitter className="w-3.5 h-3.5 text-sky-500" /> Twitter / X Profile URL
                      </label>
                      <input
                        type="url"
                        value={tempBranding.twitterUrl}
                        onChange={(e) => setTempBranding({ ...tempBranding, twitterUrl: e.target.value })}
                        className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#FF5F1F]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[#1A1A1A] flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#FF5F1F]" /> Contact Email
                      </label>
                      <input
                        type="email"
                        value={tempBranding.contactEmail}
                        onChange={(e) => setTempBranding({ ...tempBranding, contactEmail: e.target.value })}
                        className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#FF5F1F]"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Branding Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-[#1A1A1A] hover:bg-[#FF5F1F] text-white text-xs font-extrabold rounded-full transition-all shadow-md flex items-center gap-2"
                  >
                    <Check className="w-4 h-4 text-[#FF5F1F] group-hover:text-white" /> Save All Branding & Site Settings
                  </button>
                </div>

              </form>

              {/* DEDICATED PORTAL UPDATES TABLE / HISTORY LOG */}
              <div className="bg-[#FAF9F6] border border-[#E5E5E1] p-6 rounded-3xl space-y-4 mt-8">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E1] pb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1A1A1A] flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#FF5F1F]" /> Dedicated Portal Updates Table
                    </h3>
                    <p className="text-xs text-gray-500">
                      Real-time records of all website title, logo, and text updates stored in the <span className="font-mono text-[#FF5F1F] font-bold">portal_updates</span> database table.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-white border border-[#E5E5E1] rounded-full text-[#1A1A1A] shrink-0">
                    {portalUpdates.length} Saved Records
                  </span>
                </div>

                {portalUpdates.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-500 font-medium">
                    No portal updates recorded yet. Any website title or logo change will be logged here automatically.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#1A1A1A]">
                      <thead>
                        <tr className="border-b border-[#E5E5E1] text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                          <th className="py-2.5 px-3">Date & Time</th>
                          <th className="py-2.5 px-3">Updated By</th>
                          <th className="py-2.5 px-3">Website Title</th>
                          <th className="py-2.5 px-3">Tagline</th>
                          <th className="py-2.5 px-3">Logo Icon</th>
                          <th className="py-2.5 px-3">Accent Color</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E1]">
                        {portalUpdates.map((upd, idx) => (
                          <tr key={`${upd.id}-${idx}`} className="hover:bg-white/60 transition-colors">
                            <td className="py-3 px-3 font-mono text-[11px] text-gray-600 font-bold whitespace-nowrap">
                              {upd.updatedAt}
                            </td>
                            <td className="py-3 px-3 font-bold text-xs text-gray-700">
                              {upd.updatedBy || 'Admin Portal'}
                            </td>
                            <td className="py-3 px-3 font-extrabold text-xs text-[#1A1A1A]">
                              {upd.siteName}
                            </td>
                            <td className="py-3 px-3 text-xs text-gray-600 max-w-[180px] truncate">
                              {upd.tagline}
                            </td>
                            <td className="py-3 px-3">
                              {upd.customLogoUrl ? (
                                <img src={upd.customLogoUrl} alt="Logo" className="w-6 h-6 object-contain rounded border border-[#E5E5E1]" />
                              ) : (
                                <span className="font-mono text-[11px] bg-white border border-[#E5E5E1] px-2 py-0.5 rounded-md font-bold">
                                  {upd.logoIcon}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className="inline-block w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                                style={{ backgroundColor: upd.accentColor || '#FF5F1F' }}
                                title={upd.accentColor}
                              />
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setTempBranding({
                                    siteName: upd.siteName,
                                    tagline: upd.tagline,
                                    logoIcon: upd.logoIcon,
                                    customLogoUrl: upd.customLogoUrl,
                                    accentColor: upd.accentColor,
                                    announcementText: upd.announcementText,
                                    showAnnouncement: upd.showAnnouncement,
                                    heroAutoSlideEnabled: upd.heroAutoSlideEnabled,
                                    heroAutoSlideSpeed: upd.heroAutoSlideSpeed,
                                    heroSlideDirection: upd.heroSlideDirection,
                                    youtubeUrl: upd.youtubeUrl,
                                    instagramUrl: upd.instagramUrl,
                                    twitterUrl: upd.twitterUrl,
                                    contactEmail: upd.contactEmail,
                                    siteVisits: upd.siteVisits
                                  });
                                  showNotification(`Loaded version from ${upd.updatedAt}! Click "Save All" to publish.`);
                                }}
                                className="px-3 py-1 bg-white hover:bg-[#FF5F1F] hover:text-white border border-[#E5E5E1] text-gray-700 font-extrabold text-[11px] rounded-full transition-all shadow-sm"
                              >
                                Restore
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE VIDEOS */}
          {activeTab === 'videos' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-[#1A1A1A]">Video Tutorial Library</h2>
                  <p className="text-xs text-gray-500">Add, edit, or delete YouTube cooking tutorials.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSyncAllVideosWithYouTube}
                    disabled={isSyncingLiveYt}
                    className="px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-extrabold text-xs rounded-full transition-all flex items-center gap-2 border border-emerald-200 shadow-sm disabled:opacity-50"
                  >
                    {isSyncingLiveYt ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Syncing YouTube Data...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 text-emerald-600 group-hover:text-white" /> Sync Live YouTube Data
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onOpenAiModal}
                    className="px-4 py-2.5 bg-brand-accent-light text-brand-accent hover:bg-brand-accent hover:text-white font-extrabold text-xs rounded-full transition-all flex items-center gap-2 border border-brand-accent-light shadow-sm group"
                  >
                    <Sparkles className="w-4 h-4 text-brand-accent group-hover:text-white" /> AI Recipe Extractor
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      resetVideoForm();
                      setIsAddingVideo(!isAddingVideo);
                    }}
                    className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-brand-accent text-white font-extrabold text-xs rounded-full transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4 text-brand-accent" /> {isAddingVideo ? 'Close Form' : 'Add New Tutorial'}
                  </button>
                </div>
              </div>

              {/* Add / Edit Video Drawer Form */}
              {isAddingVideo && (
                <form onSubmit={handleSaveVideoSubmit} className="bg-[#FAF9F6] border border-[#E5E5E1] p-6 rounded-3xl space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-[#E5E5E1] pb-3">
                    <h3 className="font-extrabold text-sm text-[#1A1A1A]">
                      {editingVideo ? `Edit Video: ${editingVideo.title}` : 'Add New Cooking Tutorial'}
                    </h3>
                    <button type="button" onClick={() => setIsAddingVideo(false)} className="text-gray-400 hover:text-black">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="sm:col-span-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-extrabold text-[#1A1A1A]">YouTube Video URL *</label>
                        <button
                          type="button"
                          onClick={() => handleAutoFetchYtDetails()}
                          disabled={fetchingYtDetails || !videoFormUrl}
                          className="text-[11px] font-bold text-brand-accent hover:underline flex items-center gap-1 disabled:opacity-50"
                        >
                          {fetchingYtDetails ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin text-brand-accent" />
                              Fetching Details...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3" /> Auto-Extract Details
                            </>
                          )}
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          required
                          value={videoFormUrl}
                          onChange={(e) => setVideoFormUrl(e.target.value)}
                          onBlur={() => {
                            if (videoFormUrl && (!videoFormTitle || videoFormViewsCount === 125000)) {
                              handleAutoFetchYtDetails();
                            }
                          }}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="flex-1 bg-white border border-[#E5E5E1] rounded-2xl px-4 py-2 text-xs focus:outline-none focus:border-[#FF5F1F]"
                        />
                        <button
                          type="button"
                          onClick={() => handleAutoFetchYtDetails()}
                          disabled={fetchingYtDetails || !videoFormUrl}
                          className="px-4 py-2 bg-[#1A1A1A] hover:bg-brand-accent text-white rounded-2xl font-bold text-xs transition-colors shrink-0 flex items-center gap-1 disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Extract
                        </button>
                      </div>
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-extrabold text-[#1A1A1A]">Recipe Title *</label>
                      <input
                        type="text"
                        required
                        value={videoFormTitle}
                        onChange={(e) => setVideoFormTitle(e.target.value)}
                        placeholder="e.g. Masterclass Creamy Risotto"
                        className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-[#FF5F1F]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-extrabold text-[#1A1A1A]">Total Views</label>
                      <input
                        type="number"
                        value={videoFormViewsCount}
                        onChange={(e) => setVideoFormViewsCount(parseInt(e.target.value, 10) || 0)}
                        placeholder="e.g. 125000"
                        className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-4 py-2 text-xs focus:outline-none focus:border-[#FF5F1F]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-extrabold text-[#1A1A1A]">Uploaded Date</label>
                      <input
                        type="text"
                        value={videoFormUploadDate}
                        onChange={(e) => setVideoFormUploadDate(e.target.value)}
                        placeholder="e.g. Oct 14, 2023"
                        className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-4 py-2 text-xs focus:outline-none focus:border-[#FF5F1F]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-extrabold text-[#1A1A1A]">Cooking Category</label>
                      <select
                        value={videoFormCategory}
                        onChange={(e) => setVideoFormCategory(e.target.value)}
                        className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-[#FF5F1F]"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-extrabold text-[#1A1A1A]">Difficulty Level</label>
                      <select
                        value={videoFormDifficulty}
                        onChange={(e) => setVideoFormDifficulty(e.target.value as any)}
                        className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-[#FF5F1F]"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-extrabold text-[#1A1A1A]">Prep Time</label>
                      <input
                        type="text"
                        value={videoFormPrep}
                        onChange={(e) => setVideoFormPrep(e.target.value)}
                        placeholder="15 mins"
                        className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-4 py-2 text-xs focus:outline-none focus:border-[#FF5F1F]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-extrabold text-[#1A1A1A]">Cook Time</label>
                      <input
                        type="text"
                        value={videoFormCook}
                        onChange={(e) => setVideoFormCook(e.target.value)}
                        placeholder="20 mins"
                        className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-4 py-2 text-xs focus:outline-none focus:border-[#FF5F1F]"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-extrabold text-[#1A1A1A]">Description</label>
                      <textarea
                        rows={2}
                        value={videoFormDesc}
                        onChange={(e) => setVideoFormDesc(e.target.value)}
                        placeholder="Step-by-step description..."
                        className="w-full bg-white border border-[#E5E5E1] rounded-2xl p-3 text-xs focus:outline-none focus:border-[#FF5F1F]"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center gap-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={videoFormFeatured}
                          onChange={(e) => setVideoFormFeatured(e.target.checked)}
                          className="rounded text-[#FF5F1F] focus:ring-[#FF5F1F]"
                        />
                        Feature on Hero Banner
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingVideo(false)}
                      className="px-5 py-2 rounded-full border border-[#E5E5E1] text-xs font-bold text-gray-600 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#1A1A1A] hover:bg-[#FF5F1F] text-white text-xs font-bold rounded-full transition-colors"
                    >
                      {editingVideo ? 'Update Video' : 'Save New Video'}
                    </button>
                  </div>
                </form>
              )}

              {/* Videos Table */}
              <div className="border border-[#E5E5E1] rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F6] border-b border-[#E5E5E1] text-[#1A1A1A] font-extrabold uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Tutorial Video</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Level</th>
                      <th className="p-4">Times</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E1]">
                    {recipes.map(recipe => (
                      <tr key={recipe.id} className="hover:bg-[#FAF9F6] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={recipe.thumbnailUrl}
                              alt={recipe.title}
                              className="w-16 h-10 object-cover rounded-xl shrink-0"
                            />
                            <div>
                              <p className="font-extrabold text-[#1A1A1A] line-clamp-1">{recipe.title}</p>
                              <span className="text-[10px] text-gray-400 font-medium">{recipe.duration} • {recipe.viewsCount.toLocaleString()} views</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-[#F3F3F1] text-[#1A1A1A] px-2.5 py-1 rounded-full font-bold text-[10px]">
                            {recipe.categoryName}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-gray-700">{recipe.difficulty}</td>
                        <td className="p-4 text-gray-500">{recipe.prepTime} prep / {recipe.cookTime} cook</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleStartEditVideo(recipe)}
                            className="p-2 text-gray-600 hover:text-[#FF5F1F] hover:bg-[#FF5F1F]/10 rounded-full transition-colors"
                            title="Edit Video"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(recipe.id, recipe.title)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete Video"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES MANAGER */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-[#1A1A1A]">Cooking Categories</h2>
                  <p className="text-xs text-gray-500">Organize channel videos into filterable categories.</p>
                </div>

                <button
                  onClick={() => {
                    if (isAddingCategory) {
                      handleResetCategoryForm();
                    } else {
                      setEditingCategory(null);
                      setNewCatName('');
                      setNewCatDesc('');
                      setIsAddingCategory(true);
                    }
                  }}
                  className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-[#FF5F1F] text-white font-extrabold text-xs rounded-full transition-all flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4 text-[#FF5F1F]" /> {isAddingCategory ? 'Close Form' : 'Add New Category'}
                </button>
              </div>

              {/* Add / Edit Category Form */}
              {isAddingCategory && (
                <form onSubmit={handleSaveCategory} className="bg-[#FAF9F6] border border-[#E5E5E1] p-6 rounded-3xl space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-[#E5E5E1] pb-3">
                    <h3 className="font-extrabold text-sm text-[#1A1A1A]">
                      {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create Cooking Category'}
                    </h3>
                    <button type="button" onClick={handleResetCategoryForm} className="text-gray-400 hover:text-black">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-extrabold text-[#1A1A1A]">Category Name *</label>
                      <input
                        type="text"
                        required
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="e.g. Seafood & Fish"
                        className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-4 py-2 font-bold focus:outline-none focus:border-[#FF5F1F]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-extrabold text-[#1A1A1A]">Description</label>
                      <input
                        type="text"
                        value={newCatDesc}
                        onChange={(e) => setNewCatDesc(e.target.value)}
                        placeholder="Fresh seafood recipes..."
                        className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-4 py-2 focus:outline-none focus:border-[#FF5F1F]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleResetCategoryForm}
                      className="px-5 py-2 rounded-full border border-[#E5E5E1] text-xs font-bold text-gray-600 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#1A1A1A] hover:bg-[#FF5F1F] text-white text-xs font-bold rounded-full transition-colors"
                    >
                      {editingCategory ? 'Update Category' : 'Save Category'}
                    </button>
                  </div>
                </form>
              )}

              {/* Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map(cat => (
                  <div key={cat.id} className={`bg-[#FAF9F6] border p-5 rounded-3xl flex items-center justify-between shadow-sm transition-all ${
                    editingCategory?.id === cat.id ? 'border-[#FF5F1F] ring-1 ring-[#FF5F1F]' : 'border-[#E5E5E1]'
                  }`}>
                    <div>
                      <span className="text-xs font-extrabold text-[#FF5F1F] bg-[#FF5F1F]/10 px-2.5 py-0.5 rounded-full inline-block mb-1">
                        Category
                      </span>
                      <h4 className="font-extrabold text-base text-[#1A1A1A]">{cat.name}</h4>
                      <p className="text-xs text-gray-500 line-clamp-1">{cat.description}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-3">
                      <button
                        onClick={() => handleStartEditCategory(cat)}
                        className={`p-2 rounded-full transition-colors ${
                          editingCategory?.id === cat.id
                            ? 'bg-[#FF5F1F] text-white shadow-sm'
                            : 'text-gray-600 hover:text-[#FF5F1F] hover:bg-[#FF5F1F]/10'
                        }`}
                        title="Edit Category"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DIGITAL COOKBOOKS MANAGER */}
          {activeTab === 'cookbooks' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-[#1A1A1A]">Curated PDF Cookbooks</h2>
                  <p className="text-xs text-gray-500">Manage downloadable PDF bundles and recipe guides.</p>
                </div>

                <button
                  onClick={() => setIsAddingCookbook(!isAddingCookbook)}
                  className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-[#FF5F1F] text-white font-extrabold text-xs rounded-full transition-all flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4 text-[#FF5F1F]" /> Create Cookbook Bundle
                </button>
              </div>

              {/* Add Cookbook Form */}
              {isAddingCookbook && (
                <form onSubmit={handleSaveCookbook} className="bg-[#FAF9F6] border border-[#E5E5E1] p-6 rounded-3xl space-y-4">
                  <h3 className="font-extrabold text-sm text-[#1A1A1A]">New Cookbook Bundle</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-extrabold text-[#1A1A1A]">Cookbook Title *</label>
                      <input
                        type="text"
                        required
                        value={bookTitle}
                        onChange={(e) => setBookTitle(e.target.value)}
                        placeholder="e.g. Master Artisan Pasta Guide"
                        className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-4 py-2 font-bold focus:outline-none focus:border-[#FF5F1F]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-extrabold text-[#1A1A1A]">Category / Collection</label>
                      <input
                        type="text"
                        value={bookCategory}
                        onChange={(e) => setBookCategory(e.target.value)}
                        placeholder="Italian / Baking / Master Class"
                        className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-4 py-2 focus:outline-none focus:border-[#FF5F1F]"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-extrabold text-[#1A1A1A]">Cover Image URL</label>
                      <input
                        type="url"
                        value={bookCoverUrl}
                        onChange={(e) => setBookCoverUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-4 py-2 focus:outline-none focus:border-[#FF5F1F]"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-extrabold text-[#1A1A1A]">Description</label>
                      <textarea
                        rows={2}
                        value={bookDesc}
                        onChange={(e) => setBookDesc(e.target.value)}
                        placeholder="Masterclass printable guide..."
                        className="w-full bg-white border border-[#E5E5E1] rounded-2xl p-3 focus:outline-none focus:border-[#FF5F1F]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingCookbook(false)}
                      className="px-5 py-2 rounded-full border border-[#E5E5E1] text-xs font-bold text-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#1A1A1A] hover:bg-[#FF5F1F] text-white text-xs font-bold rounded-full"
                    >
                      Publish Bundle
                    </button>
                  </div>
                </form>
              )}

              {/* Cookbook Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cookbooks.map(cb => (
                  <div key={cb.id} className="bg-[#FAF9F6] border border-[#E5E5E1] rounded-3xl p-5 flex items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img src={cb.coverImageUrl} alt={cb.title} className="w-16 h-16 object-cover rounded-2xl shrink-0" />
                      <div className="overflow-hidden">
                        <span className="text-[10px] font-extrabold text-[#FF5F1F] bg-[#FF5F1F]/10 px-2 py-0.5 rounded-full inline-block">
                          {cb.category}
                        </span>
                        <h4 className="font-extrabold text-sm text-[#1A1A1A] truncate">{cb.title}</h4>
                        <p className="text-[11px] text-gray-500">{cb.downloadCount.toLocaleString()} downloads</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteCookbook(cb.id, cb.title)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0"
                      title="Delete Cookbook"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DOWNLOAD ANALYTICS & AUDIT */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-[#1A1A1A]">Download Analytics & Audit Logs</h2>
                  <p className="text-xs text-gray-500">Track PDF downloads, device breakdowns, and weekly activity.</p>
                </div>

                <button
                  onClick={exportLogsCsv}
                  className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-[#FF5F1F] text-white text-xs font-extrabold rounded-full transition-colors flex items-center gap-2 shadow-sm"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#FF5F1F]" /> Export CSV Audit Log
                </button>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#FAF9F6] border border-[#E5E5E1] p-5 rounded-3xl space-y-3">
                  <h3 className="font-extrabold text-xs text-[#1A1A1A] uppercase tracking-wider">Weekly Downloads Trend</h3>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <XAxis dataKey="day" stroke="#888888" fontSize={11} tickLine={false} />
                        <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="downloads" fill="#FF5F1F" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#FAF9F6] border border-[#E5E5E1] p-5 rounded-3xl space-y-3">
                  <h3 className="font-extrabold text-xs text-[#1A1A1A] uppercase tracking-wider">Device Downloads Breakdown</h3>
                  <div className="h-48 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deviceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {deviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Audit Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-[#1A1A1A]">Recent Audit Logs</h3>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={logSearchQuery}
                      onChange={(e) => setLogSearchQuery(e.target.value)}
                      placeholder="Search log history..."
                      className="bg-[#F3F3F1] border border-[#E5E5E1] rounded-full pl-9 pr-3 py-1.5 text-xs text-[#1A1A1A] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="border border-[#E5E5E1] rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF9F6] border-b border-[#E5E5E1] text-[#1A1A1A] font-extrabold uppercase text-[10px]">
                      <tr>
                        <th className="p-3.5">Timestamp</th>
                        <th className="p-3.5">Item Downloaded</th>
                        <th className="p-3.5">Type</th>
                        <th className="p-3.5">Device</th>
                        <th className="p-3.5">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E1]">
                      {filteredLogs.map(log => (
                        <tr key={log.id} className="hover:bg-[#FAF9F6]">
                          <td className="p-3.5 text-gray-500 font-mono text-[11px]">{log.timestamp}</td>
                          <td className="p-3.5 font-bold text-[#1A1A1A]">{log.itemName}</td>
                          <td className="p-3.5">
                            <span className="bg-[#FF5F1F]/10 text-[#FF5F1F] font-extrabold text-[10px] px-2.5 py-0.5 rounded-full">
                              {log.itemType}
                            </span>
                          </td>
                          <td className="p-3.5 text-gray-600 font-medium">{log.device}</td>
                          <td className="p-3.5 text-gray-600">{log.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SUBSCRIBERS & PUSH NOTIFICATIONS */}
          {activeTab === 'subscribers' && (
            <div className="space-y-8">
              <div>
                <span className="bg-[#FF5F1F]/10 text-[#FF5F1F] border border-[#FF5F1F]/20 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-1">
                  Audience Engagement
                </span>
                <h2 className="text-xl font-extrabold text-[#1A1A1A]">Subscribers & Broadcast Push Notifications</h2>
                <p className="text-xs text-gray-500 mt-1">Manage email subscriber list, send real-time web push notifications to visitors, and view broadcast notification logs.</p>
              </div>

              {/* Top Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#FAF9F6] border border-[#E5E5E1] p-5 rounded-3xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    <Users className="w-4 h-4 text-[#FF5F1F]" /> Active Subscribers
                  </div>
                  <div className="text-3xl font-black text-[#1A1A1A]">{subscribers.filter(s => s.status === 'active').length}</div>
                  <p className="text-[11px] text-gray-500 mt-1">Subscribed via Hero Banner & Site Footer</p>
                </div>

                <div className="bg-[#FAF9F6] border border-[#E5E5E1] p-5 rounded-3xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    <Bell className="w-4 h-4 text-[#FF5F1F]" /> Broadcasts Sent
                  </div>
                  <div className="text-3xl font-black text-[#1A1A1A]">{notifications.length}</div>
                  <p className="text-[11px] text-gray-500 mt-1">Total push notifications broadcasted</p>
                </div>

                <div className="bg-[#FAF9F6] border border-[#E5E5E1] p-5 rounded-3xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    <Send className="w-4 h-4 text-[#FF5F1F]" /> Push Delivery Status
                  </div>
                  <div className="text-3xl font-black text-emerald-600">Active 🟢</div>
                  <p className="text-[11px] text-gray-500 mt-1">In-app & Browser Push Notifications ready</p>
                </div>
              </div>

              {/* Push Notification Broadcast Composer */}
              <div className="bg-[#FAF9F6] border border-[#E5E5E1] p-6 rounded-3xl space-y-4">
                <h3 className="text-sm font-extrabold text-[#1A1A1A] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#FF5F1F]" /> Send Broadcast Push Notification
                </h3>
                <p className="text-xs text-gray-600">
                  Compose a push notification alert. It will be sent instantly as a live browser notification to all active visitors and logged in notification history.
                </p>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!pushTitle.trim() || !pushMessage.trim()) {
                      alert('Please enter both a title and message for the push notification.');
                      return;
                    }
                    setIsSendingPush(true);
                    try {
                      if (onSendPushNotification) {
                        await onSendPushNotification(
                          pushTitle.trim(),
                          pushMessage.trim(),
                          pushRecipeId || undefined,
                          pushCustomLink || undefined
                        );
                      } else {
                        const newNotif: PushNotification = {
                          id: 'notif-' + Date.now(),
                          title: pushTitle.trim(),
                          message: pushMessage.trim(),
                          recipeId: pushRecipeId || undefined,
                          linkUrl: pushCustomLink || undefined,
                          sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                          sentBy: 'Admin',
                          recipientCount: subscribers.length || 1
                        };
                        await saveNotificationToDb(newNotif);
                        if (setNotifications) {
                          setNotifications(prev => [newNotif, ...prev]);
                        }
                      }
                      showNotification(`🔥 Push Notification Broadcasted: "${pushTitle.trim()}"`);
                      setPushTitle('');
                      setPushMessage('');
                      setPushRecipeId('');
                      setPushCustomLink('');
                    } catch (err) {
                      alert('Error sending push notification.');
                    } finally {
                      setIsSendingPush(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1A1A1A]">Notification Title *</label>
                      <input
                        type="text"
                        required
                        value={pushTitle}
                        onChange={(e) => setPushTitle(e.target.value)}
                        placeholder="e.g. 🔥 New Recipe: Perfect Garlic Butter Steak!"
                        className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5F1F]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1A1A1A]">Link to Recipe (Optional)</label>
                      <select
                        value={pushRecipeId}
                        onChange={(e) => {
                          setPushRecipeId(e.target.value);
                          if (e.target.value) setPushCustomLink('');
                        }}
                        className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5F1F]"
                      >
                        <option value="">-- No specific recipe attached --</option>
                        {recipes.map(r => (
                          <option key={r.id} value={r.id}>📹 {r.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1A1A1A]">Notification Message *</label>
                    <textarea
                      required
                      rows={2}
                      value={pushMessage}
                      onChange={(e) => setPushMessage(e.target.value)}
                      placeholder="Write brief notification text for your subscribers..."
                      className="w-full bg-white border border-[#E5E5E1] rounded-2xl p-4 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5F1F]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#FF5F1F]" /> Will be sent to <strong>{subscribers.length} subscribers</strong>
                    </span>

                    <button
                      type="submit"
                      disabled={isSendingPush}
                      className="bg-[#1A1A1A] hover:bg-[#FF5F1F] text-white font-extrabold text-xs px-6 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-sm"
                    >
                      {isSendingPush ? 'Sending Broadcast...' : <><Send className="w-4 h-4" /> Broadcast Push Notification</>}
                    </button>
                  </div>
                </form>
              </div>

              {/* Subscribers List Section */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-base text-[#1A1A1A]">Subscribers Directory ({subscribers.length})</h3>
                    <p className="text-xs text-gray-500">Visitors who subscribed via the site textbox for updates and alerts.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setIsAddingSub(!isAddingSub)}
                      className="bg-[#1A1A1A] text-white hover:bg-[#FF5F1F] text-xs font-extrabold px-4 py-2 rounded-full transition-colors flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> {isAddingSub ? 'Cancel' : 'Add Subscriber'}
                    </button>

                    <button
                      onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8," 
                          + ["Email,Subscribed At,Status,Source", ...subscribers.map(s => `"${s.email}","${s.subscribedAt}","${s.status}","${s.source || 'Hero Banner'}"`)].join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "chef_studio_subscribers.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="bg-[#FAF9F6] border border-[#E5E5E1] text-[#1A1A1A] hover:bg-[#E5E5E1] text-xs font-bold px-3.5 py-2 rounded-full transition-colors flex items-center gap-1.5"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export CSV
                    </button>
                  </div>
                </div>

                {/* Optional Add Subscriber Form */}
                {isAddingSub && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newSubEmailInput || !newSubEmailInput.includes('@')) {
                        alert('Enter a valid email.');
                        return;
                      }
                      if (onAddSubscriber) {
                        await onAddSubscriber(newSubEmailInput.trim());
                      } else {
                        const newSub: Subscriber = {
                          id: 'sub-' + Date.now(),
                          email: newSubEmailInput.trim(),
                          subscribedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                          status: 'active',
                          source: 'Admin Added'
                        };
                        await saveSubscriberToDb(newSub);
                        if (setSubscribers) {
                          setSubscribers(prev => [newSub, ...prev]);
                        }
                      }
                      showNotification(`Added ${newSubEmailInput.trim()} to subscriber list!`);
                      setNewSubEmailInput('');
                      setIsAddingSub(false);
                    }}
                    className="bg-[#FAF9F6] border border-[#E5E5E1] p-4 rounded-2xl flex items-center gap-3"
                  >
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                      type="email"
                      required
                      value={newSubEmailInput}
                      onChange={(e) => setNewSubEmailInput(e.target.value)}
                      placeholder="Enter visitor email address to subscribe..."
                      className="flex-1 bg-white border border-[#E5E5E1] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#FF5F1F]"
                    />
                    <button
                      type="submit"
                      className="bg-[#FF5F1F] text-white font-extrabold text-xs px-4 py-2 rounded-xl"
                    >
                      Save Subscriber
                    </button>
                  </form>
                )}

                {/* Filter and Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={subSearchQuery}
                    onChange={(e) => setSubSearchQuery(e.target.value)}
                    placeholder="Search subscribers by email address..."
                    className="w-full bg-[#FAF9F6] border border-[#E5E5E1] rounded-2xl pl-9 pr-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5F1F]"
                  />
                </div>

                {/* Table */}
                <div className="border border-[#E5E5E1] rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF9F6] border-b border-[#E5E5E1] text-[#1A1A1A] font-extrabold uppercase text-[10px]">
                      <tr>
                        <th className="p-3.5">Email Address</th>
                        <th className="p-3.5">Subscribed Date</th>
                        <th className="p-3.5">Source</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E1]">
                      {subscribers
                        .filter(s => s.email.toLowerCase().includes(subSearchQuery.toLowerCase()))
                        .map(sub => (
                          <tr key={sub.id} className="hover:bg-[#FAF9F6] transition-colors">
                            <td className="p-3.5 font-bold text-[#1A1A1A]">{sub.email}</td>
                            <td className="p-3.5 text-gray-500 font-mono text-[11px]">{sub.subscribedAt}</td>
                            <td className="p-3.5 text-gray-600">{sub.source || 'Hero Banner'}</td>
                            <td className="p-3.5">
                              <span className={`font-extrabold text-[10px] px-2.5 py-0.5 rounded-full ${
                                sub.status === 'active' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {sub.status === 'active' ? 'Active' : 'Unsubscribed'}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={async () => {
                                  if (confirm(`Remove ${sub.email} from subscribers?`)) {
                                    if (onDeleteSubscriber) {
                                      await onDeleteSubscriber(sub.id);
                                    } else {
                                      await deleteSubscriberFromDb(sub.id);
                                      if (setSubscribers) {
                                        setSubscribers(prev => prev.filter(s => s.id !== sub.id));
                                      }
                                    }
                                    showNotification(`Subscriber ${sub.email} removed.`);
                                  }
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Subscriber"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      {subscribers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                            No subscribers found yet. Visitors can subscribe via the homepage hero banner textbox.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sent Notification History */}
              <div className="space-y-4 pt-4 border-t border-[#E5E5E1]">
                <h3 className="font-extrabold text-base text-[#1A1A1A]">Sent Broadcast History ({notifications.length})</h3>
                <div className="space-y-3">
                  {notifications.map(notif => (
                    <div key={notif.id} className="bg-[#FAF9F6] border border-[#E5E5E1] p-4 rounded-2xl flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-[#1A1A1A]">{notif.title}</span>
                          <span className="text-[10px] bg-[#FF5F1F]/10 text-[#FF5F1F] font-bold px-2 py-0.5 rounded-full">
                            Sent {notif.sentAt}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{notif.message}</p>
                      </div>
                      <span className="text-[11px] text-gray-400 shrink-0 font-bold">
                        👥 {notif.recipientCount || subscribers.length} recipients
                      </span>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className="text-xs text-gray-500 italic">No push notifications broadcasted yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SECURITY & ADMIN CREDENTIALS */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <span className="bg-[#FF5F1F]/10 text-[#FF5F1F] border border-[#FF5F1F]/20 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-1">
                  Access Management
                </span>
                <h2 className="text-xl font-extrabold text-[#1A1A1A]">Admin Security & Login Password</h2>
                <p className="text-xs text-gray-500 mt-1">Change your administrator username and password credentials.</p>
              </div>

              <form onSubmit={handleUpdateCredentials} className="bg-[#FAF9F6] border border-[#E5E5E1] p-6 rounded-3xl space-y-4 max-w-lg">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#1A1A1A] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-500" /> Admin Username
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsernameInput}
                    onChange={(e) => setNewUsernameInput(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-4 py-2.5 text-xs text-[#1A1A1A] font-bold focus:outline-none focus:border-[#FF5F1F]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#1A1A1A] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-gray-500" /> Admin Password
                  </label>
                  <input
                    type="text"
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E1] rounded-2xl px-4 py-2.5 text-xs text-[#1A1A1A] font-bold focus:outline-none focus:border-[#FF5F1F]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#1A1A1A] hover:bg-[#FF5F1F] text-white text-xs font-extrabold rounded-full transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Check className="w-4 h-4 text-[#FF5F1F]" /> Update Admin Password
                </button>
              </form>

              <div className="bg-[#FFFAF0] border border-[#FFE4B5] p-5 rounded-3xl space-y-2 max-w-lg">
                <span className="text-xs font-extrabold text-[#1A1A1A] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#FF5F1F]" /> Active Session Status
                </span>
                <p className="text-xs text-gray-600">
                  Your administrator session is currently active. Public visitors will not see the Admin Dashboard unless they authenticate with your set credentials.
                </p>
                <button
                  type="button"
                  onClick={onLogout}
                  className="mt-2 text-xs text-red-600 font-extrabold hover:underline"
                >
                  End Active Session & Logout &rarr;
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {deleteItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-[#E5E5E1] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#1A1A1A]">Confirm Deletion</h3>
                <p className="text-xs text-gray-500 capitalize">Delete {deleteItemModal.type}</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-[#1A1A1A]">"{deleteItemModal.title}"</strong>? This item will be removed from your database and cannot be restored.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteItemModal(null)}
                className="px-5 py-2.5 rounded-full border border-[#E5E5E1] text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-full transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isDeleting ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
