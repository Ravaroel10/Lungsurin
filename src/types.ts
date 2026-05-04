export type UserRole = 'USER' | 'SELLER' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  fullName: string;
  address: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  role: UserRole;
  avatar?: string;
  favorites: string[];
  points: number;
  streak: number;
  lastActionDate: string;
  createdAt?: any;
  updatedAt?: any;
  isPremium?: boolean;
  premiumStatus?: 'none' | 'pending' | 'active';
  premiumProofURL?: string;
  vouchers?: Voucher[];
  purchasedCount?: number;
  status?: 'active' | 'pending' | 'suspended';
}

export interface Voucher {
  id: string;
  code: string;
  discount: number;
  expiryDate: string;
  isUsed: boolean;
  title: string;
  description: string;
}

export type ClothingCondition = 'New' | 'Like New' | 'Good' | 'Fair';
export type AnalysisResult = 'RESELL' | 'REPAIR' | 'UPCYCLE';

export interface Product {
  id: string;
  sellerId: string;
  sellerName?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  condition: ClothingCondition;
  images: string[];
  type: 'CURATED' | 'UPCYCLED';
  analysisType?: AnalysisResult;
  impact: {
    wasteReducedKg: number;
    co2SavedKg: number;
  };
  aiCondition?: {
    fabric: string;
    stain: string;
    damage: string;
    fading: string;
  };
  aiReasoning?: string;
  aiConfidence?: number;
  rating: number;
  reviews: Review[];
  stock: number;
  isModerated: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: string;
  message?: string;
  paymentMethod?: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  total: number;
  subtotal: number;
  shippingFee: number;
  protectionFee: number;
  status: 'PROSES' | 'DIKIRIM' | 'SELESAI' | 'DIBATALKAN';
  createdAt: any;
  trackingNumber?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  orderId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'ORDER' | 'MESSAGE' | 'REWARD';
  read: boolean;
  timestamp: string;
}
