import { RecipeVideo, Category, RecipeBookBundle, DownloadLog, SiteSettings } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-pasta',
    name: 'Italian & Pasta',
    slug: 'italian-pasta',
    description: 'Authentic handmade pasta, risottos, and slow-simmered regional Italian sauces.',
    icon: 'UtensilsCrossed',
    color: 'from-amber-500 to-red-500',
    videoCount: 4,
  },
  {
    id: 'cat-quick',
    name: 'Quick 15-Min Meals',
    slug: 'quick-meals',
    description: 'Ultra-fast weeknight dinners packed with flavor without hours in the kitchen.',
    icon: 'Zap',
    color: 'from-emerald-500 to-teal-600',
    videoCount: 3,
  },
  {
    id: 'cat-baking',
    name: 'Baking & Desserts',
    slug: 'baking-desserts',
    description: 'Irresistible pastries, artisanal sourdoughs, soft cookies, and rich cakes.',
    icon: 'Cake',
    color: 'from-pink-500 to-rose-500',
    videoCount: 3,
  },
  {
    id: 'cat-asian',
    name: 'Asian Street Food',
    slug: 'asian-street-food',
    description: 'Bold curries, crispy dumplings, noodle stir-fries, and fragrant wok dishes.',
    icon: 'Flame',
    color: 'from-orange-500 to-amber-600',
    videoCount: 3,
  },
  {
    id: 'cat-vegan',
    name: 'Plant-Based & Vegan',
    slug: 'plant-based',
    description: 'Wholesome, vibrant, nutrient-packed plant-forward creations.',
    icon: 'Leaf',
    color: 'from-green-500 to-emerald-600',
    videoCount: 2,
  },
  {
    id: 'cat-bbq',
    name: 'Grill & BBQ Favorites',
    slug: 'grill-bbq',
    description: 'Smoky marinades, tender steaks, flame-kissed skewers, and homemade rubs.',
    icon: 'FlameKindling',
    color: 'from-red-600 to-orange-700',
    videoCount: 2,
  },
];

export const INITIAL_VIDEOS: RecipeVideo[] = [
  {
    id: 'rec-1',
    title: 'Authentic Creamy Carbonara (No Cream!)',
    description: 'Master the classic Roman Pasta Carbonara using traditional egg yolks, Pecorino Romano, crispy guanciale, and freshly cracked black pepper.',
    youtubeUrl: 'https://www.youtube.com/watch?v=3AAdKl1UYZs',
    youtubeVideoId: '3AAdKl1UYZs',
    categoryId: 'cat-pasta',
    categoryName: 'Italian & Pasta',
    thumbnailUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1200&q=80',
    duration: '08:45',
    difficulty: 'Medium',
    prepTime: '10 mins',
    cookTime: '12 mins',
    servings: 2,
    calories: 640,
    tags: ['Pasta', 'Italian', 'Classic', 'Dinner', 'Carbonara'],
    rating: 4.9,
    viewsCount: 142500,
    uploadDate: 'Jul 15, 2024',
    downloadsCount: 3820,
    featured: true,
    chefNote: 'Keep the pan OFF the heat when mixing egg yolks to avoid scrambling. Emulsify with starchy pasta water for glossy texture!',
    createdAt: '2026-07-15',
    ingredients: [
      { id: 'i1', name: 'Spaghetti or Rigatoni', amount: '200g', category: 'Pantry & Spices' },
      { id: 'i2', name: 'Guanciale or Pancetta (diced)', amount: '120g', category: 'Meat & Seafood' },
      { id: 'i3', name: 'Large Egg Yolks', amount: '3 yolks + 1 whole egg', category: 'Dairy & Eggs' },
      { id: 'i4', name: 'Pecorino Romano Cheese (freshly grated)', amount: '50g', category: 'Dairy & Eggs' },
      { id: 'i5', name: 'Coarsely Cracked Black Pepper', amount: '2 tsp', category: 'Pantry & Spices' },
    ],
    steps: [
      {
        stepNumber: 1,
        timestampSeconds: 15,
        title: 'Boil Water & Prep Guanciale',
        instruction: 'Bring a pot of salted water to boil. Slice guanciale into 1/2 inch strips.',
        tip: 'Don’t over-salt water since guanciale and Pecorino are naturally salty.'
      },
      {
        stepNumber: 2,
        timestampSeconds: 110,
        title: 'Crisp the Guanciale',
        instruction: 'Render guanciale in a cold skillet over medium heat for 6-8 mins until crisp and golden. Remove from heat.',
      },
      {
        stepNumber: 3,
        timestampSeconds: 240,
        title: 'Whisk Egg & Cheese Paste',
        instruction: 'Whisk egg yolks, whole egg, grated Pecorino Romano, and cracked black pepper until a thick paste forms.',
      },
      {
        stepNumber: 4,
        timestampSeconds: 380,
        title: 'Combine Pasta & Emulsify',
        instruction: 'Boil pasta 2 mins under al dente. Reserve 1/2 cup pasta water. Toss pasta in skillet with rendered fat, remove from burner, pour egg mixture and splash of pasta water, stirring vigorously.',
      },
      {
        stepNumber: 5,
        timestampSeconds: 480,
        title: 'Plate & Garnish',
        instruction: 'Serve immediately topped with extra Pecorino Romano, crispy guanciale pieces, and fresh black pepper.',
      }
    ]
  },
  {
    id: 'rec-2',
    title: '15-Minute Garlic Butter Honey Salmon',
    description: 'Crispy skin salmon fillets glazed in a pan sauce of caramelized garlic, honey, lemon juice, and fresh thyme.',
    youtubeUrl: 'https://www.youtube.com/watch?v=wT_a9P34jD8',
    youtubeVideoId: 'wT_a9P34jD8',
    categoryId: 'cat-quick',
    categoryName: 'Quick 15-Min Meals',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80',
    duration: '06:30',
    difficulty: 'Easy',
    prepTime: '5 mins',
    cookTime: '10 mins',
    servings: 2,
    calories: 480,
    tags: ['Seafood', 'Salmon', 'Healthy', 'Gluten-Free', '15-Min'],
    rating: 4.8,
    viewsCount: 98400,
    uploadDate: 'May 20, 2024',
    downloadsCount: 2940,
    featured: true,
    chefNote: 'Pat salmon skin bone-dry with paper towels before searing to guarantee a glass-shattering crisp skin.',
    createdAt: '2026-07-20',
    ingredients: [
      { id: 'i6', name: 'Fresh Salmon Fillets (skin-on)', amount: '2 fillets (180g each)', category: 'Meat & Seafood' },
      { id: 'i7', name: 'Unsalted Butter', amount: '2 tbsp', category: 'Dairy & Eggs' },
      { id: 'i8', name: 'Minced Garlic Cloves', amount: '4 cloves', category: 'Produce' },
      { id: 'i9', name: 'Raw Clover Honey', amount: '2 tbsp', category: 'Pantry & Spices' },
      { id: 'i10', name: 'Fresh Lemon Juice & Zest', amount: '1 lemon', category: 'Produce' },
      { id: 'i11', name: 'Fresh Thyme Leaves', amount: '1 tbsp', category: 'Produce' }
    ],
    steps: [
      {
        stepNumber: 1,
        timestampSeconds: 10,
        title: 'Season Salmon',
        instruction: 'Dry salmon fillets thoroughly. Season skin and flesh with kosher salt and freshly ground pepper.',
      },
      {
        stepNumber: 2,
        timestampSeconds: 85,
        title: 'Sear Skin-Side Down',
        instruction: 'Heat olive oil in a stainless steel skillet over medium-high heat. Place salmon skin side down and press flat for 4 mins.',
      },
      {
        stepNumber: 3,
        timestampSeconds: 210,
        title: 'Flip & Add Sauce',
        instruction: 'Flip fillets. Drop butter, minced garlic, honey, lemon juice, and thyme into pan. Baste salmon with spoon for 2-3 mins.',
      },
      {
        stepNumber: 4,
        timestampSeconds: 320,
        title: 'Garnish & Serve',
        instruction: 'Transfer to plate, spoon remaining caramelized pan glaze over salmon, and serve with steamed greens or jasmine rice.',
      }
    ]
  },
  {
    id: 'rec-3',
    title: 'Japanese Crispy Chicken Katsu Curry',
    description: 'Golden panko-crusted chicken cutlets paired with a rich, aromatic Japanese curry sauce over fluffy short-grain rice.',
    youtubeUrl: 'https://www.youtube.com/watch?v=0_u6oG_uS-k',
    youtubeVideoId: '0_u6oG_uS-k',
    categoryId: 'cat-asian',
    categoryName: 'Asian Street Food',
    thumbnailUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1200&q=80',
    duration: '14:20',
    difficulty: 'Medium',
    prepTime: '20 mins',
    cookTime: '25 mins',
    servings: 3,
    calories: 720,
    tags: ['Japanese', 'Chicken', 'Curry', 'Crispy', 'Street Food'],
    rating: 5.0,
    viewsCount: 210000,
    uploadDate: 'Jan 28, 2024',
    downloadsCount: 5120,
    featured: true,
    chefNote: 'Grate an apple into the curry sauce to add that signature subtle sweetness and depth!',
    createdAt: '2026-06-28',
    ingredients: [
      { id: 'i12', name: 'Boneless Chicken Thighs or Breasts', amount: '450g', category: 'Meat & Seafood' },
      { id: 'i13', name: 'Japanese Panko Breadcrumbs', amount: '1.5 cups', category: 'Pantry & Spices' },
      { id: 'i14', name: 'Japanese Curry Roux Cubes', amount: '1 box (90g)', category: 'Pantry & Spices' },
      { id: 'i15', name: 'Onions & Carrots (cubed)', amount: '2 onions, 2 carrots', category: 'Produce' },
      { id: 'i16', name: 'Yukon Gold Potatoes', amount: '2 medium', category: 'Produce' },
      { id: 'i17', name: 'Fuji Apple (grated)', amount: '1/2 apple', category: 'Produce' }
    ],
    steps: [
      {
        stepNumber: 1,
        timestampSeconds: 20,
        title: 'Simmer Curry Base',
        instruction: 'Sauté onions until golden. Add carrots, potatoes, water, and grated apple. Simmer 15 mins until veggies soften.',
      },
      {
        stepNumber: 2,
        timestampSeconds: 250,
        title: 'Dissolve Curry Roux',
        instruction: 'Turn off heat, break curry roux blocks into broth, stir until dissolved, then simmer on low for 5 mins until thick and glossy.',
      },
      {
        stepNumber: 3,
        timestampSeconds: 430,
        title: 'Bread Chicken Cutlets',
        instruction: 'Pound chicken flat. Dredge in flour, beaten egg, and press firmly into crispy panko breadcrumbs.',
      },
      {
        stepNumber: 4,
        timestampSeconds: 610,
        title: 'Fry to Golden Perfection',
        instruction: 'Deep fry cutlets at 175°C (350°F) for 4-5 mins per side until deep golden brown and internal temp reaches 74°C (165°F).',
      },
      {
        stepNumber: 5,
        timestampSeconds: 780,
        title: 'Slice & Assemble',
        instruction: 'Slice cutlet into strips, place over steamed rice, and ladle rich curry sauce over half the dish.',
      }
    ]
  },
  {
    id: 'rec-4',
    title: 'Molten Lava Chocolate Cake with Vanilla Bean Gelato',
    description: 'Decadent individual chocolate cakes with a warm, gooey flowing center baked in under 12 minutes.',
    youtubeUrl: 'https://www.youtube.com/watch?v=0k1LlhR1R4g',
    youtubeVideoId: '0k1LlhR1R4g',
    categoryId: 'cat-baking',
    categoryName: 'Baking & Desserts',
    thumbnailUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80',
    duration: '07:15',
    difficulty: 'Medium',
    prepTime: '15 mins',
    cookTime: '11 mins',
    servings: 4,
    calories: 510,
    tags: ['Chocolate', 'Dessert', 'Baking', 'Bistro', 'Warm'],
    rating: 4.9,
    viewsCount: 175000,
    uploadDate: 'Feb 14, 2024',
    downloadsCount: 4100,
    featured: false,
    chefNote: 'Use dark chocolate with at least 70% cocoa content for the ultimate rich flavor balance.',
    createdAt: '2026-07-02',
    ingredients: [
      { id: 'i18', name: '70% Dark Bittersweet Chocolate', amount: '120g', category: 'Pantry & Spices' },
      { id: 'i19', name: 'Unsalted Butter', amount: '100g', category: 'Dairy & Eggs' },
      { id: 'i20', name: 'Eggs + Yolks', amount: '2 whole eggs + 2 yolks', category: 'Dairy & Eggs' },
      { id: 'i21', name: 'Powdered Sugar', amount: '1/2 cup', category: 'Pantry & Spices' },
      { id: 'i22', name: 'All-Purpose Flour', amount: '3 tbsp', category: 'Pantry & Spices' }
    ],
    steps: [
      {
        stepNumber: 1,
        timestampSeconds: 15,
        title: 'Melt Chocolate & Butter',
        instruction: 'Melt dark chocolate and butter over a double boiler or short microwave bursts until smooth.',
      },
      {
        stepNumber: 2,
        timestampSeconds: 120,
        title: 'Whisk Eggs & Sugar',
        instruction: 'Whisk eggs, egg yolks, and powdered sugar until thick, pale, and voluminous.',
      },
      {
        stepNumber: 3,
        timestampSeconds: 210,
        title: 'Fold Batter & Fill Ramekins',
        instruction: 'Gently fold melted chocolate and flour into eggs. Divide into buttered and cocoa-dusted ramekins.',
      },
      {
        stepNumber: 4,
        timestampSeconds: 330,
        title: 'Precision Bake',
        instruction: 'Bake at 215°C (425°F) for exactly 11-12 mins until edges are firm and center slightly wobbles.',
      },
      {
        stepNumber: 5,
        timestampSeconds: 400,
        title: 'Invert & Serve',
        instruction: 'Let rest 1 min, invert onto dessert plate, dust with cocoa, and serve with vanilla bean gelato.',
      }
    ]
  },
  {
    id: 'rec-5',
    title: 'Smokey Chipotle BBQ Pulled Pork Tacos',
    description: 'Melt-in-your-mouth slow roasted pork shoulder shredded in homemade chipotle BBQ sauce with lime slaw.',
    youtubeUrl: 'https://www.youtube.com/watch?v=Jm3Uo6lX2q4',
    youtubeVideoId: 'Jm3Uo6lX2q4',
    categoryId: 'cat-bbq',
    categoryName: 'Grill & BBQ Favorites',
    thumbnailUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80',
    duration: '11:50',
    difficulty: 'Easy',
    prepTime: '20 mins',
    cookTime: '3.5 hrs',
    servings: 6,
    calories: 590,
    tags: ['BBQ', 'Tacos', 'Pork', 'Smoky', 'Crowd-Pleaser'],
    rating: 4.9,
    viewsCount: 88200,
    uploadDate: 'Aug 12, 2023',
    downloadsCount: 1980,
    featured: false,
    chefNote: 'Crisp the shredded pork under a oven broiler for 3 minutes before filling tortillas for incredible texturing.',
    createdAt: '2026-06-12',
    ingredients: [
      { id: 'i23', name: 'Pork Shoulder or Butt', amount: '1.5 kg', category: 'Meat & Seafood' },
      { id: 'i24', name: 'Smoked Paprika & Brown Sugar Rub', amount: '3 tbsp', category: 'Pantry & Spices' },
      { id: 'i25', name: 'Chipotle Peppers in Adobo', amount: '2 peppers + 2 tbsp sauce', category: 'Pantry & Spices' },
      { id: 'i26', name: 'Apple Cider Vinegar', amount: '1/3 cup', category: 'Pantry & Spices' },
      { id: 'i27', name: 'Corn Tortillas & Fresh Cilantro', amount: '12 tortillas', category: 'Produce' }
    ],
    steps: [
      {
        stepNumber: 1,
        timestampSeconds: 15,
        title: 'Spice Rub Seasoning',
        instruction: 'Coat pork shoulder generously in dry rub containing paprika, garlic powder, cumin, brown sugar, and sea salt.',
      },
      {
        stepNumber: 2,
        timestampSeconds: 180,
        title: 'Dutch Oven Roast',
        instruction: 'Sear pork in heavy pot, pour chipotle adobo broth, cover tight, and slow braise at 160°C (325°F) for 3.5 hours.',
      },
      {
        stepNumber: 3,
        timestampSeconds: 420,
        title: 'Shred & Broil Crisp',
        instruction: 'Shred tender pork with two forks, toss with braising juices, and broil on baking sheet for 4 mins to crisp edges.',
      },
      {
        stepNumber: 4,
        timestampSeconds: 600,
        title: 'Assemble Tacos',
        instruction: 'Warm corn tortillas, pile high with carnitas, top with citrus cabbage slaw and diced avocado.',
      }
    ]
  },
  {
    id: 'rec-6',
    title: 'Vibrant Creamy Thai Green Vegetable Curry',
    description: 'Fragrant lemongrass green curry simmered with coconut milk, Thai basil, bamboo shoots, tofu, and fresh veggies.',
    youtubeUrl: 'https://www.youtube.com/watch?v=I6iE5Ie6j1E',
    youtubeVideoId: 'I6iE5Ie6j1E',
    categoryId: 'cat-vegan',
    categoryName: 'Plant-Based & Vegan',
    thumbnailUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=1200&q=80',
    duration: '09:40',
    difficulty: 'Easy',
    prepTime: '15 mins',
    cookTime: '15 mins',
    servings: 4,
    calories: 420,
    tags: ['Thai', 'Vegan', 'Curry', 'Coconut', 'Gluten-Free'],
    rating: 4.8,
    viewsCount: 112000,
    uploadDate: 'Mar 08, 2024',
    downloadsCount: 2650,
    featured: false,
    chefNote: 'Fry green curry paste in coconut cream until the oil separates for maximum aromatic depth.',
    createdAt: '2026-07-08',
    ingredients: [
      { id: 'i28', name: 'Thai Green Curry Paste', amount: '3 tbsp', category: 'Pantry & Spices' },
      { id: 'i29', name: 'Full-Fat Coconut Milk', amount: '400 ml can', category: 'Pantry & Spices' },
      { id: 'i30', name: 'Firm Tofu (cubed & pan-fried)', amount: '300g', category: 'Produce' },
      { id: 'i31', name: 'Snap Peas, Zucchini & Baby Corn', amount: '2 cups assorted', category: 'Produce' },
      { id: 'i32', name: 'Thai Sweet Basil Leaves', amount: '1 cup', category: 'Produce' }
    ],
    steps: [
      {
        stepNumber: 1,
        timestampSeconds: 20,
        title: 'Fry Curry Paste',
        instruction: 'Spoon top layer of thick coconut cream into wok, add green curry paste and cook for 2 mins until fragrant.',
      },
      {
        stepNumber: 2,
        timestampSeconds: 150,
        title: 'Add Liquids & Tofu',
        instruction: 'Pour remaining coconut milk and vegetable stock. Add cubed crispy tofu and bamboo shoots.',
      },
      {
        stepNumber: 3,
        timestampSeconds: 310,
        title: 'Simmer Tender Veggies',
        instruction: 'Add snap peas and zucchini, simmer gently for 4 mins so vegetables stay crisp and vibrant green.',
      },
      {
        stepNumber: 4,
        timestampSeconds: 480,
        title: 'Finish with Thai Basil & Lime',
        instruction: 'Turn off heat, stir in fresh Thai basil leaves, soy sauce, lime juice, and serve with jasmine rice.',
      }
    ]
  }
];

export const INITIAL_COOKBOOKS: RecipeBookBundle[] = [
  {
    id: 'book-1',
    title: 'The Italian Trattoria Masterclass Cookbook',
    description: '12 classic Italian pasta recipes, handmade sauces, and traditional dough techniques compiled into a beautifully formatted digital recipe book.',
    coverImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    recipeIds: ['rec-1'],
    category: 'Italian & Pasta',
    downloadCount: 4230,
    featured: true
  },
  {
    id: 'book-2',
    title: '15-Minute Gourmet Weeknight Dinners',
    description: 'Quick high-protein dinners for busy food lovers. Includes prep shortcuts, ingredient substitution guides, and timing breakdowns.',
    coverImageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80',
    recipeIds: ['rec-2'],
    category: 'Quick 15-Min Meals',
    downloadCount: 3890,
    featured: true
  },
  {
    id: 'book-3',
    title: 'Asian Street Food & Dumpling Companion',
    description: 'Secret spice blends, broth bases, and step-by-step dough folding diagrams for authentic home cooking.',
    coverImageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    recipeIds: ['rec-3'],
    category: 'Asian Street Food',
    downloadCount: 2980,
    featured: false
  }
];

export const INITIAL_DOWNLOAD_LOGS: DownloadLog[] = [
  {
    id: 'log-101',
    timestamp: '2026-08-09 13:42',
    itemType: 'recipe_pdf',
    itemId: 'rec-1',
    itemName: 'Authentic Creamy Carbonara Recipe PDF',
    device: 'Desktop',
    location: 'United States'
  },
  {
    id: 'log-102',
    timestamp: '2026-08-09 12:15',
    itemType: 'cookbook_bundle',
    itemId: 'book-2',
    itemName: '15-Minute Gourmet Weeknight Dinners Cookbook',
    device: 'Mobile',
    location: 'United Kingdom'
  },
  {
    id: 'log-103',
    timestamp: '2026-08-09 11:04',
    itemType: 'recipe_pdf',
    itemId: 'rec-2',
    itemName: '15-Minute Garlic Butter Honey Salmon PDF',
    device: 'Tablet',
    location: 'Canada'
  },
  {
    id: 'log-104',
    timestamp: '2026-08-09 09:30',
    itemType: 'shopping_list',
    itemId: 'rec-3',
    itemName: 'Chicken Katsu Curry Shopping Checklist',
    device: 'Mobile',
    location: 'Australia'
  },
  {
    id: 'log-105',
    timestamp: '2026-08-08 22:10',
    itemType: 'cookbook_bundle',
    itemId: 'book-1',
    itemName: 'The Italian Trattoria Masterclass Cookbook',
    device: 'Desktop',
    location: 'Germany'
  },
  {
    id: 'log-106',
    timestamp: '2026-08-08 18:50',
    itemType: 'recipe_pdf',
    itemId: 'rec-4',
    itemName: 'Molten Lava Chocolate Cake Recipe PDF',
    device: 'Mobile',
    location: 'France'
  }
];

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  siteName: 'BRASOI',
  tagline: 'Cooking Tutorials & Downloadable Recipe Books | brasoi.in',
  logoIcon: 'ChefHat',
  customLogoUrl: '',
  accentColor: '#FF5F1F',
  announcementText: '🔥 Welcome to Brasoi (brasoi.in) — Download Free PDF Cookbooks & Video Guides!',
  showAnnouncement: true,
  heroAutoSlideEnabled: true,
  heroAutoSlideSpeed: 4500,
  heroSlideDirection: 'right-to-left',
  youtubeUrl: 'https://youtube.com',
  instagramUrl: 'https://instagram.com',
  twitterUrl: 'https://twitter.com',
  contactEmail: 'contact@brasoi.in',
  siteVisits: 28450
};

export const INITIAL_SUBSCRIBERS = [
  {
    id: 'sub-1',
    email: 'sarah.miller@gmail.com',
    subscribedAt: '2026-08-01 14:30',
    status: 'active' as const,
    source: 'Hero Banner'
  },
  {
    id: 'sub-2',
    email: 'alex.gourmet@yahoo.com',
    subscribedAt: '2026-08-03 09:15',
    status: 'active' as const,
    source: 'Hero Banner'
  },
  {
    id: 'sub-3',
    email: 'david.cooks@outlook.com',
    subscribedAt: '2026-08-06 18:40',
    status: 'active' as const,
    source: 'Hero Banner'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: '🔥 New Video: Perfect Garlic Butter Steak!',
    message: 'Master restaurant-style searing in 15 minutes. Check out the new video tutorial and printable guide.',
    linkUrl: '',
    recipeId: 'rec-1',
    sentAt: '2026-08-08 10:00',
    sentBy: 'Chef Studio Admin',
    recipientCount: 3
  }
];

export const DEFAULT_ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};
