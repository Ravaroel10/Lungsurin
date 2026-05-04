import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShoppingBag, 
  Leaf, 
  Trophy, 
  MessageSquare, 
  Heart, 
  Settings, 
  ChevronRight,
  TrendingUp,
  Package,
  Calendar,
  Zap,
  CheckCircle2,
  ArrowRight,
  Users,
  ShieldAlert,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  Sparkles,
  Loader2,
  UserCheck,
  UserX
} from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MOCK_ORDERS, MOCK_PRODUCTS } from '../lib/mockData';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { SellerChat } from './SellerChat';

const DASHBOARD_DATA = [
  { day: 'Mon', waste: 1.2, sales: 400, revenue: 2400 },
  { day: 'Tue', waste: 0.8, sales: 300, revenue: 1398 },
  { day: 'Wed', waste: 2.1, sales: 500, revenue: 9800 },
  { day: 'Thu', waste: 1.5, sales: 280, revenue: 3908 },
  { day: 'Fri', waste: 1.9, sales: 390, revenue: 4800 },
  { day: 'Sat', waste: 2.8, sales: 480, revenue: 3800 },
  { day: 'Sun', waste: 3.2, sales: 900, revenue: 4300 },
];

const ADMIN_PIE_DATA = [
  { name: 'Fashion', value: 400 },
  { name: 'Accessories', value: 300 },
  { name: 'Home', value: 300 },
  { name: 'Vintage', value: 200 },
];

const COLORS = ['#BB1E1E', '#D4AF37', '#F2D08A', '#4A0A0A'];

// --- SHARED COMPONENTS ---
const DashboardHeader = ({ title, subtitle, badge, user }: { title: any, subtitle: string, badge?: string, user: any }) => (
  <div className="p-8 md:p-12 lg:p-20 flex flex-col lg:flex-row lg:items-end justify-between gap-8 md:gap-12">
    <div className="space-y-6 md:space-y-8 max-w-2xl">
      <div className="flex items-center gap-3">
        <span className="tag-lime">{badge || `Node: ${user.fullName}`}</span>
        <div className="w-2 h-2 rounded-full bg-accent-lime animate-pulse" />
      </div>
      <h1 className="text-4xl sm:text-6xl lg:text-8xl font-display font-extrabold tracking-tight uppercase leading-[0.85]">{title}</h1>
      <p className="text-text-muted font-medium text-base md:text-lg leading-relaxed max-w-md">
        {subtitle}
      </p>
    </div>
    
    <div className="flex items-center gap-4 md:gap-8 p-6 md:p-10 bg-white border-2 border-primary-950 shadow-premium rounded-none w-fit">
      <div className="space-y-1">
        <p className="text-[9px] md:text-[10px] font-black text-primary-950/40 uppercase tracking-[0.2em]">Status Operasional</p>
        <div className="flex items-center gap-3">
          <p className="text-lg md:text-xl font-sans font-black uppercase tracking-tight text-primary-950">Node Aktif</p>
        </div>
      </div>
      <div className="h-10 md:h-12 w-[2px] bg-primary-950/10" />
      <div className="px-4 md:px-6 py-2 md:py-3 bg-primary-950 text-white rounded-none text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 shrink-0">
        <ShieldAlert size={14} className="text-primary-500" />
        {user.role}
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value, icon: Icon, color, index, onClick }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: index * 0.05 }}
    onClick={onClick || (() => (window as any).addNotification(`Accessing secure ${label} data pipeline...`, 'info'))}
    className={cn(
      "bg-white border-2 border-primary-950 h-[240px] flex flex-col justify-between group overflow-hidden relative p-8 shadow-premium rounded-none",
      onClick && "cursor-pointer active:scale-95 transition-all"
    )}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-none -translate-y-1/2 translate-x-1/2 group-hover:bg-primary-100 transition-colors" />
    <div className="w-16 h-16 rounded-none bg-primary-950 flex items-center justify-center mb-6 relative z-10">
      <Icon size={24} strokeWidth={1.5} className="text-white" />
    </div>
    <div className="space-y-2 relative z-10">
      <p className="text-[10px] font-black text-primary-950/40 uppercase tracking-[0.3em]">{label}</p>
      <h3 className="text-4xl font-display font-black leading-none uppercase text-black">{value}</h3>
    </div>
  </motion.div>
);

// --- BUYER DASHBOARD ---
export function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [intelligence, setIntelligence] = useState<{
    summary: string;
    advice: string[];
    archetype: string;
    nextMilestone: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (user && !intelligence && !isGenerating) {
      generateIntelligence();
    }
  }, [user]);

  const generateIntelligence = async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !user) return;

    setIsGenerating(true);
    try {
      const genAI = new GoogleGenAI({ apiKey });
      
      const userOrders = MOCK_ORDERS.filter(o => o.userId === user.id);
      
      const orderDetails = userOrders.flatMap(o => o.items).map(item => {
        const prod = MOCK_PRODUCTS.find(p => p.id === item.id);
        return prod ? prod.name : 'Unknown Item';
      }).join(', ');

      const favoriteItems = (user.favorites || []).map(favId => {
        const prod = MOCK_PRODUCTS.find(p => p.id === favId);
        return prod ? prod.name : 'Unknown Item';
      }).join(', ');
      
      const prompt = `You are Lungsurin Brain, the User Intelligence system for a circular fashion marketplace in Indonesia.
      Analyze this user data and provide deep insights about their secondary fashion habits and environmental impact.
      
      User Data:
      - Name: ${user.fullName}
      - Points: ${user.points}
      - Role: ${user.role}
      - Purchased Items: ${orderDetails || 'None yet'}
      - Favorited Items: ${favoriteItems || 'None yet'}
      - Total Orders: ${userOrders.length}
      - Favorites count: ${user.favorites?.length || 0} items
      - Premium Member: ${user.isPremium ? 'Yes' : 'No'}
      
      Respond ONLY with a JSON object in this format:
      {
        "summary": "Short 2-sentence summary of their current circular impact in Indonesian",
        "advice": ["3 specific items of advice/next steps in Indonesian"],
        "archetype": "A cool creative name for their buyer persona (e.g. Wastra Warrior, Eco-Trendsetter) in Indonesian",
        "nextMilestone": "A logical next goal for them based on their data in Indonesian"
      }
      Use Indonesian language for the values.`;

      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      
      const responseText = result.text;
      if (!responseText) throw new Error("Empty response from AI");
      
      const parsed = JSON.parse(responseText.trim());
      setIntelligence(parsed);
      (window as any).addNotification("Sinkronisasi kecerdasan Lungsurin IQ selesai.", "success");
    } catch (error) {
      console.error("Intelligence Generation Error:", error);
      (window as any).addNotification("Gagal memproses data kecerdasan.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) return null;

  const purchaseCount = Math.max(0, user.purchasedCount || 0);
  const wasteSaved = (purchaseCount * 0.82).toFixed(1);
  const carbonOffset = (purchaseCount * 4.25).toFixed(1);

  // Generate dynamic chart data based on orders
  const dynamicChartData = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, i) => ({
    day,
    waste: Math.max(0.5, (purchaseCount / 7) * (i + 1) * (0.8 + Math.random() * 0.4))
  }));

  const stats = [
    { 
      label: 'Arsip Tersimpan', 
      value: `${user.favorites?.length || 0} Item`, 
      icon: ShoppingBag,
      onClick: () => navigate('/saved')
    },
    { label: 'Mitigasi Limbah', value: `${wasteSaved}kg`, icon: Leaf },
    { label: 'Offset Karbon', value: `${carbonOffset}kg`, icon: TrendingUp },
    { label: 'Kredit Dampak', value: user.points, icon: Trophy },
  ];

  return (
    <div className="w-full h-full pb-32">
      <div className="max-w-[1800px] mx-auto">
        <DashboardHeader 
          title={<>Kecerdasan <br /> Pengguna</>}
          subtitle="Tinjauan tersistem dari kontribusi sirkular dan metrik dampak tekstil Anda."
          user={user}
        />

        <div className="item-grid bg-batik">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} index={i} />
          ))}
        </div>

        <AnimatePresence>
          {intelligence && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-4 sm:mx-8 mb-12 modular-border overflow-hidden bg-white"
            >
              <div className="bg-primary-950 p-6 md:p-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent-gold rounded-full flex items-center justify-center shadow-xl">
                    <Sparkles size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Lungsurin AI Interface</p>
                    <h3 className="text-xl font-display font-black uppercase text-white">Profil Kecerdasan: {intelligence.archetype}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => generateIntelligence()}
                  className="p-3 border border-white/10 text-white/60 hover:text-white transition-all outline-none"
                >
                  <Zap size={16} />
                </button>
              </div>
              <div className="p-8 md:p-12 lg:p-16 grid lg:grid-cols-2 gap-12 lg:gap-20">
                <div className="space-y-10">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-950/30">Ringkasan Sinergi</p>
                    <p className="text-2xl md:text-3xl font-medium leading-tight">{intelligence.summary}</p>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-950/30">Target Berikutnya</p>
                    <div className="p-6 bg-accent-lime/10 border-l-4 border-accent-lime">
                      <p className="font-display font-black uppercase italic tracking-wider">{intelligence.nextMilestone}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-950/30">Rekomendasi Strategis</p>
                  <div className="grid gap-4">
                    {intelligence.advice.map((item, i) => (
                      <div key={i} className="p-6 bg-primary-50 modular-border border-primary-950/10 flex items-center gap-6 group hover:border-primary-950 transition-all">
                        <span className="text-4xl font-display font-black text-primary-950/10 group-hover:text-accent-gold transition-colors">0{i+1}</span>
                        <p className="font-bold text-sm tracking-tight">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-8 mb-12">
          <div className="lg:col-span-2 p-6 md:p-10 lg:p-20 card-premium overflow-hidden">
            <h3 className="text-2xl md:text-4xl font-display font-bold uppercase mb-8 md:mb-12 tracking-tight">Trajektori Lingkungan</h3>
            <div className="h-[250px] md:h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dynamicChartData}>
                  <defs>
                    <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D4739" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2D4739" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5DE" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} dy={20} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                  <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="waste" stroke="#2D4739" strokeWidth={3} fillOpacity={1} fill="url(#colorWaste)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-primary-950 p-12 lg:p-16 rounded-none text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[40px] -translate-y-1/2 translate-x-1/2" />
            <div className="space-y-12 relative z-10">
              <span className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-4 py-1">Matriks Loyalitas</span>
              <h3 className="text-4xl font-display font-extrabold uppercase leading-[0.9] text-primary-100">Impact <br /> Wallet</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-white/40">
                  <span>Progress</span>
                  <span className="text-primary-100">{user.points}/1000</span>
                </div>
                <div className="h-2 bg-white/5 rounded-none w-full overflow-hidden">
                  <div className="h-full bg-primary-100 transition-all duration-1000" style={{ width: `${(user.points / 1000) * 100}%` }} />
                </div>
              </div>
            </div>
            <button 
              onClick={() => (window as any).addNotification('Initializing reward decryption... Voucher will be available in 24h.', 'success')}
              className="px-6 py-4 bg-white text-primary-950 font-black uppercase tracking-widest text-xs mt-12 hover:bg-primary-100 transition-all"
            >
              Claim Reward 01
            </button>
          </div>
        </div>

        {/* --- NEW: PACKAGE TRACKING SEGMENT --- */}
        <div className="p-10 lg:p-20 bg-primary-950 rounded-none mx-8 mb-20 text-white relative overflow-hidden ring-4 ring-primary-950 bg-batik-dark">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500/10 blur-[60px] translate-y-1/2 -translate-x-1/2" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mb-16 relative z-10 px-6">
            <div className="space-y-4">
              <span className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-4 py-1">Live Supply Chain</span>
              <h2 className="text-5xl lg:text-7xl text-primary-100">Order <br /> Logistics</h2>
            </div>
            <p className="text-white/40 font-medium max-w-sm text-sm leading-relaxed uppercase tracking-[0.3em] text-right">
              Real-time synchronization with the circular delivery network.
            </p>
          </div>

          <div className="space-y-6 relative z-10">
            {MOCK_ORDERS.filter(o => o.userId === user.id).slice(0, 2).map((order, i) => (
              <div key={order.id} className="p-10 bg-white/5 rounded-none border-2 border-white/10 grid grid-cols-1 lg:grid-cols-4 gap-12 items-center group hover:bg-white/10 transition-all duration-700">
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Reference ID</p>
                  <p className="text-2xl font-display font-black uppercase tracking-tight text-white">#{order.id.toUpperCase()}</p>
                </div>

                <div className="lg:col-span-2">
                  <div className="space-y-6">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className={cn(order.status === 'SELESAI' ? "text-primary-100" : "text-white")}>
                        Status: {order.status === 'SELESAI' ? 'Delivered' : 'In Transit'}
                      </span>
                      <span className="text-white/60">{order.status === 'SELESAI' ? '100%' : '75%'} complete</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-none w-full relative overflow-hidden border border-white/10">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: order.status === 'SELESAI' ? '100%' : '75%' }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-none",
                          order.status === 'SELESAI' ? "bg-primary-100" : "bg-white"
                        )} 
                      />
                    </div>
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.3em] opacity-30">
                      <span>Store Exit</span>
                      <span>Global Hub</span>
                      <span>Home Delivery</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsChatOpen(true)}
                    className="py-4 px-6 bg-white border-2 border-primary-950 text-primary-950 font-black uppercase tracking-widest text-[10px] hover:bg-primary-50 transition-all flex items-center gap-2"
                  >
                    <MessageSquare size={14} />
                    Chat Penjual
                  </motion.button>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => (window as any).addNotification(`Full manifest for #${order.id} decrypted. Accessing logistics logs...`, 'info')}
                    className="py-4 px-10 bg-primary-950 text-white font-black uppercase tracking-widest text-[10px] hover:bg-primary-500 transition-all shadow-xl"
                  >
                    Track Manifest
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <SellerChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        storeName="Lungsurin Archive"
      />
    </div>
  );
}

export function SellerDashboard() {
  const { user } = useAuth();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', category: 'Upcycled' });

  if (!user) return null;

  const stats = [
    { label: 'Active Inventory', value: '42 Units', icon: Package },
    { label: 'Net Revenue', value: '$12,400', icon: TrendingUp },
    { label: 'Pending Orders', value: '08', icon: Calendar },
    { label: 'Brand Impact', value: 'A+', icon: Zap },
  ];

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    (window as any).addNotification(`Protocol [${newProduct.name}] successfully uploaded to neural network.`, 'success');
    setIsAddingProduct(false);
    setNewProduct({ name: '', price: '', stock: '', category: 'Upcycled' });
  };

  return (
    <div className="w-full h-full pb-32">
      <div className="max-w-[1800px] mx-auto">
        <DashboardHeader 
          title={<>Trade <br /> Nexus</>}
          subtitle="Manage your circular storefront and monitor revenue velocity."
          badge="Store: Circular Studio X"
          user={user}
        />

        <div className="item-grid modular-border border-t-0 border-x-0 bg-batik">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} index={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 modular-border border-t-0 border-x-0 uppercase">
          <div className="p-8 md:p-12 lg:p-24 modular-border border-y-0 border-l-0 bg-white">
            <h3 className="text-2xl md:text-4xl font-display font-black uppercase mb-8 md:mb-12">Revenue Stream</h3>
            <div className="h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DASHBOARD_DATA}>
                  <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E5E5DE" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                  <Tooltip cursor={{ fill: '#F7F7F0' }} contentStyle={{ borderRadius: '0', border: '1px solid black' }} />
                  <Bar dataKey="revenue" fill="#1A1A1A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="p-12 lg:p-24 space-y-12">
            <div className="flex items-center justify-between">
              <h3 className="text-4xl font-display font-black uppercase">Inventory Matrix</h3>
              <motion.button 
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsAddingProduct(!isAddingProduct)}
                className={cn(
                  "p-4 border-2 transition-all",
                  isAddingProduct ? "bg-white border-rose-500 text-rose-500" : "bg-primary-950 border-primary-950 text-white hover:bg-primary-500"
                )}
              >
                {isAddingProduct ? <Trash2 size={20} /> : <Plus size={20} />}
              </motion.button>
            </div>
            
            <AnimatePresence mode="wait">
              {isAddingProduct ? (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleCreateProduct}
                  className="bg-white border-2 border-primary-950 p-6 md:p-8 space-y-6 shadow-xl"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary-950/40">Product Name</label>
                      <input 
                        required
                        type="text" 
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        className="w-full h-12 bg-primary-50 border border-primary-950/10 px-4 font-bold text-xs focus:outline-none focus:border-primary-500 transition-all uppercase"
                        placeholder="e.g. Vintage NMAX Custom Pouch"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary-950/40">Price (USD)</label>
                        <input 
                          required
                          type="number" 
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                          className="w-full h-12 bg-primary-50 border border-primary-950/10 px-4 font-bold text-xs focus:outline-none uppercase"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary-950/40">Stock Units</label>
                        <input 
                          required
                          type="number" 
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                          className="w-full h-12 bg-primary-50 border border-primary-950/10 px-4 font-bold text-xs focus:outline-none uppercase"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-4 bg-primary-950 text-white font-black uppercase text-xs tracking-[0.3em] hover:bg-primary-500 transition-all shadow-lg"
                  >
                    Sync to Archive
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="list"
                  className="space-y-4"
                >
                  {MOCK_PRODUCTS.slice(0, 4).map(product => (
                    <div key={product.id} className="p-4 md:p-6 modular-border bg-white flex flex-col sm:flex-row items-center justify-between gap-6 group hover:bg-black hover:text-white transition-all duration-500">
                      <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
                        <img src={product.images[0]} className="w-14 md:w-16 h-18 md:h-20 object-cover grayscale group-hover:grayscale-0 shrink-0" alt="" referrerPolicy="no-referrer" />
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight">{product.name}</p>
                          <p className="text-[10px] text-text-muted group-hover:text-white/40 uppercase font-black">{product.stock} in stock</p>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto justify-end">
                        <motion.button 
                          whileTap={{ scale: 0.94 }}
                          onClick={() => (window as any).addNotification(`Editing protocol for ${product.name} initialized.`, 'info')}
                          className="p-2 md:p-3 text-text-muted group-hover:text-white hover:bg-white/10"
                        >
                          <Edit size={16} />
                        </motion.button>
                        <motion.button 
                          whileTap={{ scale: 0.94 }}
                          onClick={() => (window as any).addNotification(`Deletion request for ${product.name} queued. Waiting for admin approval.`, 'error')}
                          className="p-2 md:p-3 text-rose-500 hover:bg-rose-500/10"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- ADMIN DASHBOARD ---
export function AdminDashboard() {
  const { user } = useAuth();
  const [pendingAdmins, setPendingAdmins] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'ADMIN'),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPendingAdmins(users);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (userId: string) => {
    setIsProcessing(userId);
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: 'active'
      });
      (window as any).addNotification('Admin approved successfully.', 'success');
    } catch (error) {
      console.error(error);
      const errInfo = {
        error: error instanceof Error ? error.message : String(error),
        authInfo: {
          userId: user.id,
          email: user.email,
        },
        operationType: 'update',
        path: `users/${userId}`
      };
      console.error('Firestore Error:', JSON.stringify(errInfo));
      (window as any).addNotification('Failed to approve admin.', 'error');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (userId: string) => {
    setIsProcessing(userId);
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: 'USER',
        status: 'active'
      });
      (window as any).addNotification('Admin request rejected. User demoted to Eco-User.', 'info');
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(null);
    }
  };

  if (!user) return null;

  const stats = [
    { label: 'Total Ecosystem', value: '4.2k Users', icon: Users },
    { label: 'Global Mitigation', value: '1.2 Tons', icon: Leaf },
    { label: 'System Purity', value: '98%', icon: ShieldAlert },
    { label: 'Market Velocity', value: '+14%', icon: TrendingUp },
  ];

  return (
    <div className="w-full h-full pb-32">
      <div className="max-w-[1800px] mx-auto">
        <DashboardHeader 
          title={<>Command <br /> Interface</>}
          subtitle="System oversight and moderation protocols for the circular economy."
          badge="Authority: System Administrator"
          user={user}
        />

        <div className="item-grid modular-border border-t-0 border-x-0 bg-batik">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} index={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 modular-border border-t-0 border-x-0">
          <div className="p-12 lg:p-20 bg-white modular-border border-y-0 border-l-0">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-8 italic">Admin Approval</h3>
            <div className="space-y-6">
              {pendingAdmins.length === 0 ? (
                <div className="p-8 modular-border bg-primary-50 text-center border-dashed">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary-950/30">No Pending Requests</p>
                </div>
              ) : (
                pendingAdmins.map((admin) => (
                  <div key={admin.id} className="p-6 modular-border bg-white shadow-sm space-y-4 group hover:bg-primary-950 hover:text-white transition-all">
                    <div>
                      <p className="text-xs font-black uppercase">{admin.fullName || admin.email}</p>
                      <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest">{admin.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                         disabled={!!isProcessing}
                         onClick={() => handleApprove(admin.id)}
                         className="flex-1 py-3 bg-accent-sage text-white font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 hover:bg-accent-sage/80 disabled:opacity-50"
                      >
                        {isProcessing === admin.id ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={12} />}
                        Approve
                      </button>
                      <button 
                        disabled={!!isProcessing}
                        onClick={() => handleReject(admin.id)}
                        className="flex-1 py-3 border border-primary-950 text-primary-950 group-hover:border-white group-hover:text-white font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 hover:bg-rose-500 hover:text-white hover:border-rose-500 disabled:opacity-50"
                      >
                        {isProcessing === admin.id ? <Loader2 size={12} className="animate-spin" /> : <UserX size={12} />}
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-12 p-6 bg-primary-50 modular-border">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 leading-relaxed">
                <ShieldAlert size={14} className="inline mr-2 text-primary-500" />
                Note: Admin approval requires manual verification of credentials.
              </p>
            </div>
          </div>
          
          <div className="lg:col-span-2 p-12 lg:p-20 space-y-12">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase tracking-tight italic">Moderation Queue</h3>
              <div className="flex items-center gap-2 p-2 modular-border">
                <Search size={14} className="text-text-muted" />
                <input type="text" placeholder="Scan records..." className="bg-transparent border-0 text-[10px] uppercase font-black tracking-widest w-40 focus:ring-0" />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E5E5DE]">
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Entity</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Timestamp</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-text-muted font-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5DE]">
                  {[
                    { id: '001', img: 'https://images.unsplash.com/photo-1590736704728-f4730bb3c3af?q=80&w=100' },
                    { id: '002', img: 'https://images.unsplash.com/photo-1582200843468-22340eccdbfc?q=80&w=100' },
                    { id: '003', img: 'https://images.unsplash.com/photo-1610444583713-39958369792a?q=80&w=100' },
                    { id: '004', img: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=100' },
                    { id: '005', img: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=100' }
                  ].map((record, i) => (
                    <tr key={i} className="group hover:bg-accent-cream transition-colors">
                      <td className="py-6">
                        <div className="flex items-center gap-4">
                          <img src={record.img} className="w-10 h-10 object-cover" alt="" referrerPolicy="no-referrer" />
                          <p className="text-xs font-black uppercase tracking-tight">Record_{record.id}_SPEC</p>
                        </div>
                      </td>
                      <td className="py-6">
                        <span className="px-3 py-1 bg-accent-sage/10 text-accent-sage text-[9px] font-black uppercase tracking-widest">Pending</span>
                      </td>
                      <td className="py-6 text-[10px] font-black uppercase opacity-40">21.04.2026</td>
                      <td className="py-6">
                        <div className="flex gap-2">
                          <motion.button 
                            whileTap={{ scale: 0.94 }}
                            onClick={() => (window as any).addNotification('Decrypting record contents... High-res view loading.', 'info')}
                            className="p-2 modular-border hover:bg-black hover:text-white transition-all"
                          >
                            <Eye size={12} />
                          </motion.button>
                          <motion.button 
                            whileTap={{ scale: 0.94 }}
                            onClick={() => (window as any).addNotification('Record verified. Entity status updated to APPROVED.', 'success')}
                            className="p-2 modular-border hover:bg-accent-sage hover:text-white transition-all"
                          >
                            <CheckCircle2 size={12} />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
