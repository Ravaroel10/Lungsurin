import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ShoppingBag, Leaf, Trophy, BookOpen, Search, Filter, AppWindow as Window, Cpu, Zap, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { cn } from '../lib/utils';
import { useCart } from '../contexts/CartContext';
import { Logo } from './Logo';
import { USD_TO_IDR } from '../constants';

const CATEGORIES = ['Semua', 'Daur Ulang', 'Jual Lagi', 'Perbaikan', 'Vintage'];

const BANNERS = [
  {
    title: "Revolusi Daur Ulang",
    subtitle: "Ubah limbah menjadi karya fashion kelas tinggi.",
    color: "bg-primary-500",
    image: "https://images.unsplash.com/photo-1582201942988-13e60e4556ee?auto=format&fit=crop&q=80&w=1200",
    cta: "Jelajahi Sekarang"
  },
  {
    title: "Logistik Bebas Limbah",
    subtitle: "Sistem perbaikan mandiri kini telah dimulai.",
    color: "bg-primary-900",
    image: "https://images.unsplash.com/photo-1582200843468-22340eccdbfc?auto=format&fit=crop&q=80&w=1200",
    cta: "Gabung Aliran"
  }
];

export function Home() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Filter out products with 0 stock or undefined stock immediately
      const prods = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Product))
        .filter(p => p.stock !== undefined && p.stock > 0);
      setProducts(prods);
    });
    return () => unsubscribe();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.volume = 0.2;
    audio.play().catch(() => {});
    (window as any).addNotification(`${product.name} dimasukkan ke keranjang.`, 'success');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-primary-50 flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 z-0 text-white">
          <img 
            src="https://raw.githubusercontent.com/Ravaroel10/COZY/main/ChatGPT%20Image%20Apr%2028%2C%202026%2C%2011_11_51%20AM.png" 
            alt="Lungsurin Circular Patchwork" 
            className="w-full h-full object-cover filter brightness-[0.3] contrast-[1.1]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-primary-950/20 mix-blend-overlay" />
        </div>

        {/* Mandatory Auth Overlay */}
        <div className="relative z-10 flex-1 flex items-center justify-center p-6 sm:p-12">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl bg-white border-4 border-primary-950 p-12 md:p-24 text-center shadow-2xl space-y-12 rounded-none bg-batik"
          >
            <div className="space-y-8">
              <div className="mx-auto flex justify-center py-6 sm:py-8">
                <Logo size={100} />
              </div>
              <div className="space-y-6 sm:space-y-8">
                <h2 className="text-5xl sm:text-6xl md:text-8xl font-serif font-bold tracking-tight leading-[0.85] text-primary-950">
                  Lestarikan <br /><span className="text-[#8B1A1A]">Pakaian Adat</span>
                </h2>
                <p className="text-primary-900/60 font-medium text-base sm:text-lg md:text-xl max-w-lg mx-auto leading-relaxed px-4">
                  Ekosistem circular fashion berbasis AI khusus busana tradisional Indonesia. Berdayakan budaya, kurangi limbah.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link to="/login" className="bg-primary-950 text-white w-full px-16 py-6 text-base font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-primary-500 transition-all">
                  Masuk <Zap size={20} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link to="/signup" className="bg-white text-primary-950 border-2 border-primary-950 w-full px-16 py-6 text-base font-black uppercase tracking-[0.2em] hover:bg-primary-950 hover:text-white transition-all">
                  Daftar Baru
                </Link>
              </motion.div>
            </div>
            
            <div className="pt-12 border-t border-black/5 flex items-center justify-center gap-12 opacity-30 grayscale blur-[0.5px]">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Vogue_logo.svg" className="h-6" alt="Vogue" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/ee/Hypebeast_logo.png" className="h-6" alt="Hypebeast" />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // SHOPPER / AUTHENTICATED DASHBOARD
  return (
    <div className="bg-primary-50 min-h-screen pt-24 pb-32 md:pb-48">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 space-y-8 md:space-y-12">
        
        {/* Header / Search Bar (Shopee Influence) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
          <div className="flex-1 w-full max-w-3xl relative group">
            <Search className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-primary-950 opacity-100 w-5 h-5 md:w-6 md:h-6" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari arsip sirkular, denim daur ulang..."
              className="w-full h-16 md:h-20 bg-white border-2 border-primary-950 pl-16 md:pl-20 pr-6 md:pr-8 font-display font-black uppercase tracking-widest text-[9px] md:text-xs outline-none focus:bg-primary-50 transition-all shadow-md placeholder:text-primary-900/30"
            />
          </div>
          <div className="flex items-center justify-between w-full md:w-auto gap-6">
             <div className="flex flex-col text-left md:text-right">
                <span className="text-[9px] md:text-xs font-black uppercase tracking-widest text-primary-900">Sistem 4.2</span>
                <span className="text-xs md:text-sm font-black text-primary-500">Kolektif Aktif</span>
             </div>
             <button 
                onClick={() => (window as any).addNotification("Menerapkan pencarian lanjutan...", "info")}
                className="w-12 h-12 md:w-16 md:h-16 border-2 border-primary-950 bg-white flex items-center justify-center text-primary-950 hover:bg-primary-950 hover:text-white transition-all shadow-sm"
             >
                <Filter size={20} />
             </button>
          </div>
        </div>

        {/* Banner Section (Shopee Influence) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <motion.div 
            className={cn("lg:col-span-8 relative h-[320px] sm:h-[450px] md:h-[600px] modular-border overflow-hidden group shadow-xl", BANNERS[activeBanner].color)}
          >
            <img 
              src={BANNERS[activeBanner].image} 
              className="absolute inset-0 w-full h-full object-cover object-right-top opacity-100 group-hover:scale-110 transition-transform duration-[4s]" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="relative z-10 p-6 sm:p-8 md:p-16 h-full flex flex-col justify-end text-white">
              <motion.div
                key={activeBanner}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-3 sm:space-y-4 md:space-y-6"
              >
                <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif font-black tracking-tighter leading-[0.85] text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                  {BANNERS[activeBanner].title}
                </h2>
                <p className="text-sm sm:text-lg md:text-2xl font-bold opacity-100 max-w-xl line-clamp-2 md:line-clamp-none text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">{BANNERS[activeBanner].subtitle}</p>
                <div className="flex gap-4 pt-2 sm:pt-4">
                  <Link to="/analyze" className="h-10 sm:h-12 md:h-14 px-6 sm:px-8 md:px-12 bg-white text-black font-display font-black uppercase tracking-widest text-[9px] sm:text-[10px] md:text-xs flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all shadow-2xl">
                    {BANNERS[activeBanner].cta}
                  </Link>
                </div>
              </motion.div>
            </div>
            {/* Dots */}
            <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 flex gap-2 md:gap-3">
              {BANNERS.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveBanner(i)}
                  className={cn("w-2 h-2 md:w-3 md:h-3 rounded-full transition-all shadow-lg", activeBanner === i ? "bg-white w-8 md:w-10" : "bg-white/40")}
                />
              ))}
            </div>
          </motion.div>
          <div className="lg:col-span-4 h-full">
            <Link to="/analyze" className="bg-primary-100 modular-border p-6 sm:p-8 md:p-10 flex flex-col justify-between group cursor-pointer relative overflow-hidden shadow-lg hover:shadow-2xl transition-all bg-batik-kawung h-full min-h-[180px]">
               <Window className="text-primary-900/10 absolute -right-8 -bottom-8 w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 transform -rotate-12 transition-transform group-hover:rotate-0 duration-500" />
               <div className="relative z-10 shrink-0">
                 <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-black leading-tight text-primary-900 break-words uppercase">Penawaran <br className="hidden md:block" /> Kilat</h3>
                 <p className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary-900/50 mt-1 sm:mt-2">Berakhir dalam 04:22:10</p>
               </div>
               <div className="relative z-10 w-full sm:w-fit h-8 sm:h-10 px-4 sm:px-6 bg-primary-900 text-white font-display font-black uppercase tracking-widest text-[8px] sm:text-[10px] flex items-center justify-center sm:justify-start gap-2 group-hover:bg-primary-500 transition-all mt-4 sm:mt-6">
                  Lihat Rilis <ArrowRight size={10} />
               </div>
            </Link>
          </div>
        </div>

        {/* Quick Menu Icons (Shopee influence) */}
        <div className="bg-white border-2 border-primary-950 p-4 sm:p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-8 shadow-sm bg-batik">
          {[
            { icon: Sparkles, label: 'Scan Busana', path: '/analyze', color: 'bg-primary-950 text-white' },
            { icon: BookOpen, label: 'Edukasi', path: '/education', color: 'bg-primary-500 text-white' },
            { icon: Leaf, label: 'Dampak', path: '/dashboard', color: 'bg-primary-500 text-white' },
            { icon: ShoppingBag, label: 'Keranjang', path: '/cart', color: 'bg-primary-950 text-white' },
            { icon: Zap, label: 'Pasar', path: '/marketplace', color: 'bg-primary-500 text-white' },
            { icon: Heart, label: 'Favorit', path: '/saved', color: 'bg-primary-950 text-white' },
          ].map((item, i) => (
            <Link key={i} to={item.path} className="flex flex-col items-center gap-2 sm:gap-4 group">
              <div className={cn("w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-none flex items-center justify-center transition-all group-hover:scale-110 shadow-md", item.color)}>
                <item.icon className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-primary-950 group-hover:text-primary-500 transition-colors text-center whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Feature Banner Section (The new image) */}
        <div className="relative h-[250px] md:h-[450px] modular-border overflow-hidden group shadow-2xl">
          <img 
            src="https://raw.githubusercontent.com/Ravaroel10/COZY/main/ChatGPT%20Image%20Apr%2028%2C%202026%2C%2011_11_51%20AM.png" 
            alt="Lungsurin Culture" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[6s]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-950/80 via-primary-950/40 to-transparent flex flex-col justify-center p-8 md:p-16">
            <div className="max-w-2xl space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-300">Warisan Budaya</p>
              <h2 className="text-3xl md:text-6xl font-serif font-black text-white leading-none tracking-tighter">Seni Sirkularitas <br /> Indonesia</h2>
              <p className="text-white/80 font-medium text-sm md:text-lg max-w-lg">
                Menghubungkan tradisi tekstil dengan teknologi pemindaian AI modern untuk masa depan fashion yang lebih bijak.
              </p>
            </div>
          </div>
        </div>

        {/* Marketplace Head */}
        <div id="marketplace" className="sticky top-16 md:top-20 z-30 bg-primary-50/90 backdrop-blur-md pt-6 pb-8 space-y-6 bg-batik-kawung border-b border-primary-950/10 px-4 sm:px-6 -mx-4 sm:-mx-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
            <h2 className="text-3xl md:text-5xl font-serif font-black tracking-tighter text-center md:text-left">Rekomendasi</h2>
            <div className="flex items-center gap-4 overflow-x-auto pb-4 w-full md:w-auto scrollbar-hide no-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-10 py-3 whitespace-nowrap font-display text-xs font-black uppercase tracking-[0.2em] transition-all modular-border",
                    selectedCategory === cat 
                      ? "bg-primary-500 text-white shadow-xl scale-105" 
                      : "bg-white text-primary-500 hover:bg-primary-900 hover:text-white"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8"
        >
          <AnimatePresence mode='popLayout'>
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white modular-border group cursor-pointer relative flex flex-col shadow-sm hover:shadow-2xl transition-all duration-500"
              >
                <Link to={`/product/${product.id}`} className="flex flex-col h-full">
                  <div className="aspect-square sm:aspect-[4/5] overflow-hidden relative shrink-0">
                    <img 
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=800'} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    {product.stock <= 3 && product.stock > 0 && (
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-accent-clay text-white text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 sm:px-3 sm:py-1.5 rounded-none shadow-2xl animate-pulse">
                        Stok Menipis
                      </div>
                    )}
                    {product.condition && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/95 backdrop-blur-md shadow-2xl px-2 py-1 sm:px-3 sm:py-1 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-primary-950 modular-border">
                        {product.condition}
                      </div>
                    )}
                  </div>
                  <div className="p-4 sm:p-6 flex flex-col flex-1 space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-start">
                       <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-accent-clay truncate">{product.category}</p>
                    </div>
                    <h3 className="font-serif text-base sm:text-lg md:text-xl font-black tracking-tight line-clamp-2 leading-snug flex-1 group-hover:text-primary-500 transition-colors text-black">
                      {product.name}
                    </h3>
                    <div className="flex flex-wrap items-end justify-between gap-2 pt-4 border-t border-primary-950/20 mt-auto">
                      <div className="flex flex-col min-w-0">
                        {product.originalPrice && (
                          <span className="text-[10px] text-primary-900/60 line-through font-bold truncate">Rp{(product.originalPrice * USD_TO_IDR).toLocaleString('id-ID')}</span>
                        )}
                        <span className="text-lg sm:text-xl font-black text-primary-500 truncate">Rp{(product.price * USD_TO_IDR).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white bg-primary-950 px-2.5 py-1 shrink-0">
                        {product.stock} Unit
                      </div>
                    </div>
                  </div>
                </Link>
                <button 
                  onClick={(e) => handleQuickAdd(e, product)}
                  className="w-full h-12 sm:h-14 border-t-2 border-primary-950 flex items-center justify-center gap-2 sm:gap-3 font-display text-[9px] sm:text-[11px] font-black uppercase tracking-widest bg-primary-950 text-white hover:bg-primary-500 transition-all duration-300"
                >
                  <span className="truncate">Masukkan Keranjang</span> <ShoppingBag size={12} className="shrink-0" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="py-60 text-center space-y-8">
            <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag size={48} className="text-primary-200" />
            </div>
            <div className="space-y-2">
              <h3 className="text-5xl font-display font-black uppercase tracking-tighter">Arsip Kosong</h3>
              <p className="text-text-muted font-medium text-xl">Sistem tidak dapat menemukan item dalam protokol ini.</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory('Semua')}
              className="px-12 py-5 bg-primary-900 text-white font-display font-black uppercase tracking-widest text-sm hover:bg-accent-clay transition-all shadow-xl"
            >
              Bersihkan Filter
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}

