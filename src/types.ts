export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  category?: 'Produce' | 'Dairy & Eggs' | 'Pantry & Spices' | 'Meat & Seafood' | 'Other';
}

export interface CookingStep {
  stepNumber: number;
  timestampSeconds: number; // For video player seeking
  title: string;
  instruction: string;
  tip?: string;
}

export interface RecipeVideo {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  categoryId: string;
  categoryName: string;
  thumbnailUrl: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  prepTime: string;
  cookTime: string;
  servings: number;
  calories?: number;
  tags: string[];
  rating: number;
  viewsCount: number;
  uploadDate?: string;
  downloadsCount: number;
  ingredients: Ingredient[];
  steps: CookingStep[];
  featured?: boolean;
  chefNote?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string; // Tailwind color class or hex
  videoCount?: number;
}

export interface RecipeBookBundle {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  recipeIds: string[];
  category: string;
  downloadCount: number;
  featured?: boolean;
}

export interface DownloadLog {
  id: string;
  timestamp: string;
  itemType: 'recipe_pdf' | 'cookbook_bundle' | 'shopping_list';
  itemId: string;
  itemName: string;
  device: 'Mobile' | 'Desktop' | 'Tablet';
  location: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  logoIcon: string; // 'ChefHat' | 'Utensils' | 'Flame' | 'Sparkles' | 'CookingPot' | 'Award'
  customLogoUrl?: string; // Optional custom logo image URL or base64 data URL
  accentColor: string; // e.g. '#FF5F1F'
  announcementText: string;
  showAnnouncement: boolean;
  heroAutoSlideEnabled?: boolean;
  heroAutoSlideSpeed?: number;
  heroSlideDirection?: 'right-to-left' | 'left-to-right';
  youtubeUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  contactEmail: string;
  siteVisits?: number;
}

export interface PortalUpdate {
  id: string;
  updatedAt: string;
  updatedBy: string;
  siteName: string;
  tagline: string;
  logoIcon: string;
  customLogoUrl?: string;
  accentColor: string;
  announcementText: string;
  showAnnouncement: boolean;
  heroAutoSlideEnabled?: boolean;
  heroAutoSlideSpeed?: number;
  heroSlideDirection?: 'right-to-left' | 'left-to-right';
  youtubeUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  contactEmail: string;
  siteVisits?: number;
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
  source?: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  linkUrl?: string;
  recipeId?: string;
  sentAt: string;
  sentBy?: string;
  recipientCount?: number;
}

export interface AdminCredentials {
  username: string;
  password: string;
}

export interface ChannelAnalytics {
  totalVideos: number;
  totalCategories: number;
  totalDownloads: number;
  totalViews: number;
  popularCategory: string;
  weeklyDownloads: { day: string; downloads: number; views: number }[];
  deviceBreakdown: { name: string; value: number; color: string }[];
  categoryDistribution: { category: string; count: number }[];
}
