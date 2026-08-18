import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  RecipeVideo,
  Category,
  RecipeBookBundle,
  DownloadLog,
  SiteSettings,
  AdminCredentials,
  Subscriber,
  PushNotification,
  PortalUpdate
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_VIDEOS,
  INITIAL_COOKBOOKS,
  INITIAL_DOWNLOAD_LOGS,
  INITIAL_SITE_SETTINGS,
  DEFAULT_ADMIN_CREDENTIALS,
  INITIAL_SUBSCRIBERS,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)')
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// COLLECTION NAMES
const RECIPES_COL = 'recipes';
const CATEGORIES_COL = 'categories';
const COOKBOOKS_COL = 'cookbooks';
const DOWNLOADS_COL = 'download_logs';
const SETTINGS_COL = 'settings';
const PORTAL_UPDATES_COL = 'portal_updates';
const ADMIN_COL = 'admin';
const SUBSCRIBERS_COL = 'subscribers';
const NOTIFICATIONS_COL = 'notifications';

// Initialize Cloud Database with initial data if empty
export async function initializeDatabaseIfEmpty() {
  try {
    // 1. Check recipes
    const recipesSnap = await getDocs(collection(db, RECIPES_COL));
    if (recipesSnap.empty) {
      for (const recipe of INITIAL_VIDEOS) {
        await setDoc(doc(db, RECIPES_COL, recipe.id), recipe);
      }
    }

    // 2. Check categories
    const categoriesSnap = await getDocs(collection(db, CATEGORIES_COL));
    if (categoriesSnap.empty) {
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(db, CATEGORIES_COL, cat.id), cat);
      }
    }

    // 3. Check cookbooks
    const cookbooksSnap = await getDocs(collection(db, COOKBOOKS_COL));
    if (cookbooksSnap.empty) {
      for (const cb of INITIAL_COOKBOOKS) {
        await setDoc(doc(db, COOKBOOKS_COL, cb.id), cb);
      }
    }

    // 4. Check download logs
    const downloadsSnap = await getDocs(collection(db, DOWNLOADS_COL));
    if (downloadsSnap.empty) {
      for (const log of INITIAL_DOWNLOAD_LOGS) {
        await setDoc(doc(db, DOWNLOADS_COL, log.id), log);
      }
    }

    // 5. Check site settings & portal_updates
    const settingsSnap = await getDocs(collection(db, SETTINGS_COL));
    const portalSnap = await getDocs(collection(db, PORTAL_UPDATES_COL));

    if (settingsSnap.empty && portalSnap.empty) {
      const initialRecord: PortalUpdate = {
        id: 'initial-portal-setup',
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        updatedBy: 'System Initializer',
        ...INITIAL_SITE_SETTINGS
      };
      await setDoc(doc(db, SETTINGS_COL, 'siteSettings'), INITIAL_SITE_SETTINGS);
      await setDoc(doc(db, PORTAL_UPDATES_COL, 'initial-portal-setup'), initialRecord);
      await setDoc(doc(db, PORTAL_UPDATES_COL, 'current'), initialRecord);
    }

    // 6. Check admin credentials
    const adminDocRef = doc(db, ADMIN_COL, 'credentials');
    const adminSnap = await getDocs(collection(db, ADMIN_COL));
    if (adminSnap.empty) {
      await setDoc(adminDocRef, DEFAULT_ADMIN_CREDENTIALS);
    }

    // 7. Check subscribers
    const subSnap = await getDocs(collection(db, SUBSCRIBERS_COL));
    if (subSnap.empty) {
      for (const sub of INITIAL_SUBSCRIBERS) {
        await setDoc(doc(db, SUBSCRIBERS_COL, sub.id), sub);
      }
    }

    // 8. Check notifications
    const notifSnap = await getDocs(collection(db, NOTIFICATIONS_COL));
    if (notifSnap.empty) {
      for (const notif of INITIAL_NOTIFICATIONS) {
        await setDoc(doc(db, NOTIFICATIONS_COL, notif.id), notif);
      }
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

// REALTIME LISTENERS
export function subscribeRecipes(callback: (recipes: RecipeVideo[]) => void) {
  return onSnapshot(collection(db, RECIPES_COL), (snapshot) => {
    const items: RecipeVideo[] = [];
    const mockMap = new Map(INITIAL_VIDEOS.map(v => [v.id, v]));

    snapshot.forEach((doc) => {
      const data = doc.data() as RecipeVideo;
      const initialMatch = mockMap.get(data.id);
      
      // If recipe has empty/missing ingredients or steps, merge from rich initial definition
      const mergedRecipe: RecipeVideo = {
        ...data,
        ingredients: (data.ingredients && data.ingredients.length > 0)
          ? data.ingredients
          : (initialMatch?.ingredients || []),
        steps: (data.steps && data.steps.length > 0)
          ? data.steps
          : (initialMatch?.steps || [])
      };
      items.push(mergedRecipe);
    });

    // If Firestore collection has items, return them; if empty, fallback to initial videos
    if (items.length > 0) {
      callback(items);
    } else {
      callback(INITIAL_VIDEOS);
    }
  });
}

export function subscribeCategories(callback: (categories: Category[]) => void) {
  return onSnapshot(collection(db, CATEGORIES_COL), (snapshot) => {
    const items: Category[] = [];
    snapshot.forEach((doc) => {
      items.push(doc.data() as Category);
    });
    callback(items);
  });
}

export function subscribeCookbooks(callback: (cookbooks: RecipeBookBundle[]) => void) {
  return onSnapshot(collection(db, COOKBOOKS_COL), (snapshot) => {
    const items: RecipeBookBundle[] = [];
    snapshot.forEach((doc) => {
      items.push(doc.data() as RecipeBookBundle);
    });
    callback(items);
  });
}

const safeParseDate = (d?: string): number => {
  if (!d) return 0;
  const isoStr = d.includes(' ') && !d.includes('T') ? d.replace(' ', 'T') : d;
  const time = new Date(isoStr).getTime();
  return isNaN(time) ? 0 : time;
};

export function subscribeDownloadLogs(callback: (logs: DownloadLog[]) => void) {
  return onSnapshot(collection(db, DOWNLOADS_COL), (snapshot) => {
    const items: DownloadLog[] = [];
    snapshot.forEach((doc) => {
      items.push(doc.data() as DownloadLog);
    });
    // Sort latest first with cross-browser Safari-safe date parser
    items.sort((a, b) => safeParseDate(b.timestamp) - safeParseDate(a.timestamp));
    callback(items);
  });
}

export async function fetchCurrentSiteSettings(): Promise<SiteSettings | null> {
  try {
    const portalSnap = await getDocs(collection(db, PORTAL_UPDATES_COL));
    if (!portalSnap.empty) {
      const records: PortalUpdate[] = [];
      portalSnap.forEach(docSnap => {
        if (docSnap.id !== 'current') {
          const data = docSnap.data() as PortalUpdate;
          if (data && data.siteName) {
            records.push(data);
          }
        }
      });
      if (records.length > 0) {
        records.sort((a, b) => safeParseDate(b.updatedAt) - safeParseDate(a.updatedAt));
        const { id, updatedAt, updatedBy, ...settings } = records[0];
        return settings as SiteSettings;
      }

      const currentDoc = await getDoc(doc(db, PORTAL_UPDATES_COL, 'current'));
      if (currentDoc.exists()) {
        return currentDoc.data() as SiteSettings;
      }
    }

    const settingsSnap = await getDoc(doc(db, SETTINGS_COL, 'siteSettings'));
    if (settingsSnap.exists()) {
      return settingsSnap.data() as SiteSettings;
    }
  } catch (err) {
    console.error('Error fetching site settings from DB:', err);
  }
  return null;
}

export function subscribeSiteSettings(callback: (settings: SiteSettings) => void) {
  // Realtime subscription across all documents in portal_updates collection
  const unsubPortalCol = onSnapshot(collection(db, PORTAL_UPDATES_COL), (snapshot) => {
    if (!snapshot.empty) {
      const records: PortalUpdate[] = [];
      snapshot.forEach(docSnap => {
        if (docSnap.id !== 'current') {
          const data = docSnap.data() as PortalUpdate;
          if (data && data.siteName) {
            records.push(data);
          }
        }
      });

      if (records.length > 0) {
        records.sort((a, b) => safeParseDate(b.updatedAt) - safeParseDate(a.updatedAt));
        const { id, updatedAt, updatedBy, ...settings } = records[0];
        const latestSettings = settings as SiteSettings;
        localStorage.setItem('chef_studio_site_settings', JSON.stringify(latestSettings));
        callback(latestSettings);
        return;
      }

      const currentDoc = snapshot.docs.find(d => d.id === 'current');
      if (currentDoc && currentDoc.exists()) {
        const settings = currentDoc.data() as SiteSettings;
        localStorage.setItem('chef_studio_site_settings', JSON.stringify(settings));
        callback(settings);
      }
    }
  });

  const unsubSettingsDoc = onSnapshot(doc(db, SETTINGS_COL, 'siteSettings'), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data() as SiteSettings;
      localStorage.setItem('chef_studio_site_settings', JSON.stringify(data));
      callback(data);
    }
  });

  return () => {
    unsubPortalCol();
    unsubSettingsDoc();
  };
}

export function subscribePortalUpdates(callback: (updates: PortalUpdate[]) => void) {
  return onSnapshot(collection(db, PORTAL_UPDATES_COL), (snapshot) => {
    const items: PortalUpdate[] = [];
    const seenIds = new Set<string>();
    snapshot.forEach((docSnap) => {
      if (docSnap.id !== 'current') {
        const data = docSnap.data() as PortalUpdate;
        const uniqueId = docSnap.id || data.id;
        if (uniqueId && !seenIds.has(uniqueId)) {
          seenIds.add(uniqueId);
          items.push({
            ...data,
            id: uniqueId
          });
        }
      }
    });
    items.sort((a, b) => safeParseDate(b.updatedAt) - safeParseDate(a.updatedAt));
    callback(items);
  });
}

export function subscribeAdminCredentials(callback: (creds: AdminCredentials) => void) {
  return onSnapshot(doc(db, ADMIN_COL, 'credentials'), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as AdminCredentials);
    }
  });
}

export function subscribeSubscribers(callback: (subscribers: Subscriber[]) => void) {
  return onSnapshot(collection(db, SUBSCRIBERS_COL), (snapshot) => {
    const items: Subscriber[] = [];
    snapshot.forEach((doc) => {
      items.push(doc.data() as Subscriber);
    });
    items.sort((a, b) => safeParseDate(b.subscribedAt) - safeParseDate(a.subscribedAt));
    callback(items);
  });
}

export function subscribeNotifications(callback: (notifications: PushNotification[]) => void) {
  return onSnapshot(collection(db, NOTIFICATIONS_COL), (snapshot) => {
    const items: PushNotification[] = [];
    snapshot.forEach((doc) => {
      items.push(doc.data() as PushNotification);
    });
    items.sort((a, b) => safeParseDate(b.sentAt) - safeParseDate(a.sentAt));
    callback(items);
  });
}

// PERSISTENCE MUTATIONS
export async function saveRecipeToDb(recipe: RecipeVideo) {
  await setDoc(doc(db, RECIPES_COL, recipe.id), recipe);
}

export async function deleteRecipeFromDb(id: string) {
  await deleteDoc(doc(db, RECIPES_COL, id));
}

export async function saveCategoryToDb(category: Category) {
  await setDoc(doc(db, CATEGORIES_COL, category.id), category);
}

export async function deleteCategoryFromDb(id: string) {
  await deleteDoc(doc(db, CATEGORIES_COL, id));
}

export async function saveCookbookToDb(cookbook: RecipeBookBundle) {
  await setDoc(doc(db, COOKBOOKS_COL, cookbook.id), cookbook);
}

export async function deleteCookbookFromDb(id: string) {
  await deleteDoc(doc(db, COOKBOOKS_COL, id));
}

export async function saveDownloadLogToDb(log: DownloadLog) {
  await setDoc(doc(db, DOWNLOADS_COL, log.id), log);
}

export async function saveSiteSettingsToDb(settings: SiteSettings, updatedBy = 'Chef Studio Admin') {
  // Save to primary settings document
  await setDoc(doc(db, SETTINGS_COL, 'siteSettings'), settings);

  // Save to current portal update record
  await setDoc(doc(db, PORTAL_UPDATES_COL, 'current'), settings);

  // Record a dedicated log entry in portal_updates table
  const updateId = 'update-' + Date.now();
  const portalRecord: PortalUpdate = {
    id: updateId,
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    updatedBy,
    ...settings
  };
  await setDoc(doc(db, PORTAL_UPDATES_COL, updateId), portalRecord);

  // Cache locally
  localStorage.setItem('chef_studio_site_settings', JSON.stringify(settings));
}

export async function incrementSiteVisitsInDb() {
  try {
    const current = await fetchCurrentSiteSettings();
    if (current) {
      const newVisits = (current.siteVisits || 28450) + 1;
      const updated: SiteSettings = {
        ...current,
        siteVisits: newVisits
      };
      await setDoc(doc(db, SETTINGS_COL, 'siteSettings'), updated);
      await setDoc(doc(db, PORTAL_UPDATES_COL, 'current'), updated);
      localStorage.setItem('chef_studio_site_settings', JSON.stringify(updated));
    }
  } catch (err) {
    console.error('Error incrementing site visits:', err);
  }
}

export async function saveAdminCredentialsToDb(creds: AdminCredentials) {
  await setDoc(doc(db, ADMIN_COL, 'credentials'), creds);
}

export async function saveSubscriberToDb(subscriber: Subscriber) {
  await setDoc(doc(db, SUBSCRIBERS_COL, subscriber.id), subscriber);
}

export async function deleteSubscriberFromDb(id: string) {
  await deleteDoc(doc(db, SUBSCRIBERS_COL, id));
}

export async function saveNotificationToDb(notification: PushNotification) {
  await setDoc(doc(db, NOTIFICATIONS_COL, notification.id), notification);
}
