/**
 * Dynamic Favicon Manager
 * Automatically synchronizes the browser favicon with the uploaded brand logo image
 * or active vector icon & theme accent color in real time.
 */

const SVG_ICONS_MAP: Record<string, string> = {
  ChefHat: `<path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="6" y1="17" x2="18" y2="17" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
  Utensils: `<path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M12 2v20" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M18 11v11" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M6 2v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2V2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M8 11v11" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
  Flame: `<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="white"/>`,
  Sparkles: `<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" stroke="white" stroke-width="1.8" fill="white"/><path d="M5 3v4M19 17v4M3 5h4M17 19h4" stroke="white" stroke-width="1.8" stroke-linecap="round"/>`,
  CookingPot: `<path d="M2 12h20" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="m4 8 16-4" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  Award: `<circle cx="12" cy="8" r="6" stroke="white" stroke-width="2" fill="none"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`
};

/**
 * Generates an SVG data URL for a vector icon on a branded background
 */
function createVectorIconFavicon(iconName: string = 'ChefHat', accentColor: string = '#FF5F1F'): string {
  const iconContent = SVG_ICONS_MAP[iconName] || SVG_ICONS_MAP['ChefHat'];
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="16" fill="${accentColor}" />
  <g transform="translate(12, 12) scale(1.667)">
    ${iconContent}
  </g>
</svg>`.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Creates a square PNG favicon from an image (data URL or web URL) using an offscreen canvas
 * to ensure crisp scaling and compatibility across all browser tabs.
 */
function createOptimizedFaviconFromImage(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    // If it's already an SVG data URL, we can resolve immediately
    if (imageUrl.startsWith('data:image/svg+xml')) {
      return resolve(imageUrl);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(imageUrl);
        }

        // Clear canvas
        ctx.clearRect(0, 0, size, size);

        // Draw image centered keeping aspect ratio
        const aspect = img.width / img.height;
        let drawW = size;
        let drawH = size;
        let offsetX = 0;
        let offsetY = 0;

        if (aspect > 1) {
          drawH = size / aspect;
          offsetY = (size - drawH) / 2;
        } else if (aspect < 1) {
          drawW = size * aspect;
          offsetX = (size - drawW) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch (err) {
        // Fallback to raw URL if canvas read fails (e.g. CORS)
        resolve(imageUrl);
      }
    };

    img.onerror = () => {
      // Fallback to raw URL
      resolve(imageUrl);
    };

    img.src = imageUrl;
  });
}

/**
 * Updates or creates the browser's favicon links in `<head>`
 */
function setFaviconLinkHref(href: string) {
  if (typeof document === 'undefined') return;

  const linkSelectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]'
  ];

  let foundAny = false;

  linkSelectors.forEach((selector) => {
    const existing = document.querySelector(selector) as HTMLLinkElement | null;
    if (existing) {
      existing.href = href;
      foundAny = true;
    }
  });

  if (!foundAny) {
    const newLink = document.createElement('link');
    newLink.rel = 'icon';
    newLink.href = href;
    document.head.appendChild(newLink);
  }
}

/**
 * Main API to update the favicon to match the uploaded logo or current branding settings
 */
export async function updateAppFavicon(branding: {
  customLogoUrl?: string;
  logoIcon?: string;
  accentColor?: string;
  siteName?: string;
}) {
  if (typeof document === 'undefined') return;

  const { customLogoUrl, logoIcon, accentColor, siteName } = branding;

  // 1. If a custom logo is uploaded / provided, use it
  if (customLogoUrl && customLogoUrl.trim().length > 0) {
    try {
      const optimizedFaviconUrl = await createOptimizedFaviconFromImage(customLogoUrl.trim());
      setFaviconLinkHref(optimizedFaviconUrl);
      return;
    } catch (e) {
      setFaviconLinkHref(customLogoUrl.trim());
      return;
    }
  }

  // 2. Otherwise, use the selected logo vector icon with the accent color
  const vectorFaviconUrl = createVectorIconFavicon(logoIcon || 'ChefHat', accentColor || '#FF5F1F');
  setFaviconLinkHref(vectorFaviconUrl);

  // Also update document title if site name is provided
  if (siteName && siteName.trim()) {
    if (!document.title.toLowerCase().includes(siteName.toLowerCase())) {
      document.title = `${siteName} - Cooking Tutorials & Recipe Cookbooks`;
    }
  }
}
