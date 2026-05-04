import { User, Product, Order } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    username: 'rafael_eco',
    fullName: 'Rafael Eco',
    address: '123 Green St, Sustainability City',
    email: 'rafa@example.com',
    gender: 'Male',
    dateOfBirth: '1995-06-15',
    phoneNumber: '+1234567890',
    role: 'USER',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&h=200&auto=format&fit=crop',
    favorites: ['p1', 'p3'],
    points: 450,
    streak: 5,
    lastActionDate: '2026-04-18',
  },
  {
    id: 's1',
    username: 'eco_craft_bali',
    fullName: 'Eco Craft Bali',
    address: 'Denpasar, Bali',
    email: 'seller@example.com',
    gender: 'Other',
    dateOfBirth: '1990-01-01',
    phoneNumber: '+0987654321',
    role: 'SELLER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop',
    favorites: [],
    points: 1200,
    streak: 12,
    lastActionDate: '2026-04-19',
  },
  {
    id: 'a1',
    username: 'admin_lungsurin',
    fullName: 'System Admin',
    address: 'Lungsurin HQ',
    email: 'admin@lungsurin.com',
    gender: 'Female',
    dateOfBirth: '1985-03-20',
    phoneNumber: '+1122334455',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop',
    favorites: [],
    points: 0,
    streak: 0,
    lastActionDate: '2026-04-19',
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    sellerId: 's1',
    name: 'Vintage Levi\'s Upcycled Denim Jacket',
    description: 'A timeless cold-weather staple, reworked from multiple thrifted jackets into a unique patchwork design.',
    price: 450000,
    originalPrice: 550000,
    category: 'Fashion',
    condition: 'Like New',
    images: ['https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=800&auto=format&fit=crop'],
    type: 'UPCYCLED',
    analysisType: 'UPCYCLE',
    aiCondition: {
      fabric: "Heavyweight Cotton Denim",
      stain: "None detected post-treatment",
      damage: "Intentional distressing",
      fading: "Moderate vintage washout"
    },
    aiReasoning: "The original garments had significant wear on sleeves, making them unfit for standard resale. Upcycling via patchwork maximizes fabric utility.",
    aiConfidence: 94,
    impact: {
      wasteReducedKg: 1.2,
      co2SavedKg: 5.4,
    },
    rating: 4.8,
    reviews: [
      { id: 'r1', userId: 'u1', userName: 'Rafael Eco', rating: 5, comment: 'Amazing quality and fit!', date: '2026-04-10' }
    ],
    stock: 1,
    isModerated: true,
  },
  {
    id: 'p2',
    sellerId: 's1',
    name: 'Hand-dyed Indigo Tote Bag',
    description: 'Made from leftover canvas scraps and dyed with natural organic indigo from East Java.',
    price: 180000,
    category: 'Accessories',
    condition: 'New',
    images: ['https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=800&auto=format&fit=crop'],
    type: 'CURATED',
    analysisType: 'RESELL',
    aiCondition: {
      fabric: "Organic Canvas Cotton",
      stain: "None",
      damage: "Flawless",
      fading: "None"
    },
    aiReasoning: "Excellent condition, natural dyes intact. Fits premium resale standards directly without intervention.",
    aiConfidence: 98,
    impact: {
      wasteReducedKg: 0.4,
      co2SavedKg: 1.8,
    },
    rating: 4.5,
    reviews: [],
    stock: 5,
    isModerated: true,
  },
  {
    id: 'p3',
    sellerId: 's1',
    name: 'Repaired Vintage Linen Shirt',
    description: 'A classic 1970s linen shirt with visible mending embroidery over small tears. Adding character to history.',
    price: 275000,
    category: 'Fashion',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1614715838608-dd527c46231d?q=80&w=800&auto=format&fit=crop'],
    type: 'CURATED',
    analysisType: 'REPAIR',
    aiCondition: {
      fabric: "100% Vintage Linen",
      stain: "Slight yellowing on collar",
      damage: "Minor tear on lower left seam",
      fading: "Even, authentic vintage fade"
    },
    aiReasoning: "The structural integrity is excellent, but a minor tear prevents direct resale. Embroidery repair is highly recommended to add value.",
    aiConfidence: 89,
    impact: {
      wasteReducedKg: 0.6,
      co2SavedKg: 3.2,
    },
    rating: 4.9,
    reviews: [],
    stock: 2,
    isModerated: true,
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'o1',
    userId: 'u1',
    customerName: 'Rafael Eco',
    customerPhone: '+1234567890',
    shippingAddress: '123 Green St, Sustainability City',
    paymentMethod: 'DANA',
    items: [
      { id: 'p1', name: 'Vintage Levi\'s Upcycled Denim Jacket', price: 450000, quantity: 1, image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=800&auto=format&fit=crop' }
    ],
    total: 476000,
    subtotal: 450000,
    shippingFee: 25000,
    protectionFee: 1000,
    status: 'SELESAI',
    createdAt: { toDate: () => new Date('2026-04-15') },
  }
];
