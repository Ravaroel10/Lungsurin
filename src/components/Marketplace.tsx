import React, { useEffect, useState } from 'react';
import { ShoppingCart, Heart, Search, Filter, Star, ShieldCheck, MessageCircle, Menu, X, Box, Tag, Zap, Info, BookOpen, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { USD_TO_IDR } from '../constants';
import { formatRp, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';

export function Marketplace() {
  const { user, updateUser } = useAuth();
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [realProducts, setRealProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedProducts = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Product[];
        setRealProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  const categories = ['Semua', 'Fashion', 'Aksesoris', 'Rumah', 'Vintage'];

  const filteredProducts = realProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = category === 'All' || p.category === category;
    const hasStock = (p.stock || 0) > 0;
    return matchesSearch && matchesCat && hasStock;
  });

  const toggleFavorite = (productId: string) => {
    if (!user) {
      (window as any).addNotification('Silakan login untuk mengkurasi barang.', 'info');
      return;
    }
    const isFav = user.favorites.includes(productId);
    const newFavs = isFav 
      ? user.favorites.filter(id => id !== productId)
      : [...user.favorites, productId];
    updateUser({ favorites: newFavs });
    (window as any).addNotification(isFav ? 'Dihapus dari kurasi.' : 'Ditambahkan ke kurasi.', 'success');
  };

  return (
    <div className="w-full min-h-screen pt-8 pb-32 focus:outline-none bg-primary-50 overflow-x-hidden">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-primary-950/40 backdrop-blur-sm z-[100] cursor-pointer"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-white z-[101] border-r-4 border-primary-950 shadow-[10px_0px_30px_rgba(0,0,0,0.1)] p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-primary-950 text-white flex items-center justify-center font-black text-xl italic shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">L</div>
                   <span className="font-display font-black uppercase tracking-widest text-lg">MENU</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-primary-50 transition-colors">
                  <X size={24} className="text-primary-950" />
                </button>
              </div>

              <div className="space-y-2 flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary-500 mb-4 px-2">Eksplorasi</p>
                {[
                  { icon: <Zap size={18} />, label: 'Marketplace', path: '/marketplace' },
                  { icon: <Heart size={18} />, label: 'Kurasi Saya', path: '/favorites' },
                  { icon: <Box size={18} />, label: 'Pesanan Saya', path: '/orders' },
                  { icon: <ShoppingCart size={18} />, label: 'Vault (Keranjang)', path: '/cart' },
                  { icon: <BookOpen size={18} />, label: 'Edukasi', path: '/education' },
                  { icon: <Crown size={18} />, label: 'Premium', path: '/premium' },
                ].map((item) => (
                  <Link 
                    key={item.label}
                    to={item.path}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-primary-50 font-black uppercase tracking-widest text-xs transition-all border-2 border-transparent hover:border-primary-950 group"
                  >
                    <span className="text-primary-500 group-hover:text-primary-950">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="mt-auto p-4 bg-primary-50 border-2 border-primary-950/10">
                <p className="text-[9px] font-bold text-primary-900/40 uppercase tracking-widest text-center">
                  Lungsurin v1.2.0 <br />
                  Digital Archive Project
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="max-w-[1920px] mx-auto">
          <div className="px-6 sm:px-8 lg:px-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8 md:gap-12 mb-12 sm:mb-24 py-16 sm:py-24 bg-batik-kawung border-b-2 border-primary-950/20 relative">
            {/* Burger Menu Button */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="absolute top-6 left-6 lg:left-16 p-3 sm:p-4 bg-white border-2 border-primary-950 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all z-20 group"
            >
              <Menu size={20} className="text-primary-950 group-hover:scale-110 transition-transform sm:w-6 sm:h-6" strokeWidth={3} />
            </button>

            <div className="flex flex-col space-y-6 lg:space-y-8 max-w-4xl mt-16 lg:mt-0">
              <div>
                <div className="flex items-center gap-3">
                  <span className="tag-lime inline-block text-[10px] sm:text-xs">Arsip Sirkular</span>
                  <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" />
                </div>
              </div>
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[10vw] font-display font-black leading-[0.8] tracking-tight uppercase">Esensi <br /> Pasar</h1>
            <p className="text-text-muted font-medium max-w-md text-base sm:text-lg leading-relaxed">
              Pilihan terkurasi dengan sejarah mendalam. Setiap item dianalisis secara digital.
            </p>
          </div>

          <div className="w-full lg:w-[450px]">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="TELUSURI ARSIP..."
                className="w-full px-6 sm:px-10 py-5 sm:py-6 bg-white border-2 border-primary-950 rounded-none shadow-premium font-display font-black uppercase tracking-widest text-base sm:text-lg focus:outline-none focus:bg-primary-50 transition-all text-primary-950"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 bg-primary-950 text-white rounded-none group-hover:bg-primary-500 transition-colors">
                <Search className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 mb-12 sm:mb-20">
          <div className="flex flex-wrap gap-2 p-2 bg-white border-2 border-primary-950 rounded-xl shadow-premium w-full sm:w-fit overflow-x-auto no-scrollbar scrollbar-hide">
            {categories.map(cat => (
              <motion.button
                whileTap={{ scale: 0.96 }}
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-6 sm:px-8 py-3 sm:py-4 rounded-none font-black uppercase tracking-widest text-[10px] sm:text-[11px] transition-all whitespace-nowrap",
                  category === cat 
                    ? "bg-primary-950 text-white shadow-lg" 
                    : "text-primary-950/60 hover:bg-primary-50 hover:text-primary-950"
                )}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 px-6 sm:px-8 pb-40">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="group card-premium !p-6 space-y-6 flex flex-col relative"
            >
              <Link to={`/product/${product.id}`} className="absolute inset-0 z-10" aria-label={`View ${product.name}`} />
              <div className="relative aspect-[4/5] overflow-hidden rounded-none border border-primary-950/10">
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <motion.button 
                  whileTap={{ scale: 0.94 }}
                  onClick={(e) => { e.preventDefault(); toggleFavorite(product.id); }}
                  className={cn(
                    "absolute top-5 right-5 p-4 rounded-none backdrop-blur-xl z-20 transition-all cursor-pointer border border-white/20",
                    user?.favorites.includes(product.id) 
                      ? "bg-primary-500 text-white shadow-lg border-primary-500" 
                      : "bg-white/20 text-white hover:bg-white/40"
                  )}
                >
                  <Heart size={20} fill={user?.favorites.includes(product.id) ? "currentColor" : "none"} strokeWidth={2} />
                </motion.button>

                <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 relative z-20 pointer-events-none">
                   <span className="tag-lime backdrop-blur-md">-{product.impact.wasteReducedKg}kg MITIGATED</span>
                </div>
              </div>

              <div className="space-y-4 flex-1 flex flex-col relative z-20 pointer-events-none">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <p className="text-[10px] font-black tracking-widest text-primary-400 uppercase">{product.category}</p>
                       <span className="w-1 h-1 bg-primary-200 rounded-full" />
                       <p className="text-[10px] font-black tracking-widest text-primary-900/40 uppercase">{product.sellerName || 'Archive'}</p>
                    </div>
                    <h3 className="text-2xl font-display font-black leading-tight uppercase group-hover:text-primary-500 transition-colors text-primary-900">
                      {product.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    {product.originalPrice && (
                      <p className="text-xs text-primary-300 line-through font-bold mb-0.5">{formatRp(product.originalPrice * USD_TO_IDR)}</p>
                    )}
                    <p className="font-display font-bold text-xl text-primary-500">{formatRp(product.price * USD_TO_IDR)}</p>
                    {product.stock !== undefined && (
                      <p className={cn(
                        "text-[9px] font-black uppercase tracking-widest mt-1",
                        product.stock <= 3 ? "text-primary-400" : "text-primary-900/40"
                      )}>
                        {product.stock} {product.stock === 1 ? 'unit' : 'units'} left
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="pt-4 mt-auto pointer-events-auto flex gap-2">
                    <motion.button 
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.preventDefault();
                        if (user && !user.favorites.includes(product.id)) {
                          const newFavs = [...user.favorites, product.id];
                          updateUser({ favorites: newFavs });
                        }
                        addToCart(product, 1);
                        (window as any).addNotification(`${product.name} diarsipkan & ditambahkan ke vault.`, 'success');
                      }}
                      className="btn-premium flex-1 bg-primary-900 text-white hover:bg-primary-500 flex items-center justify-center gap-2 group/btn cursor-pointer border-none py-3 text-[10px]"
                    >
                      <ShoppingCart size={16} />
                      ARSIPKAN
                    </motion.button>
                    <Link 
                      to={`/product/${product.id}#chat`}
                      className="w-12 h-12 bg-white border-2 border-primary-950 flex items-center justify-center text-primary-950 hover:bg-primary-50 transition-all pointer-events-auto"
                      title="Pesan Langsung"
                    >
                      <MessageCircle size={18} />
                    </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ size, className }: { size: number, className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>;
}

function Leaf({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8a7 7 0 0 1-7 7c-.32 0-.64-.02-.95-.06Z" />
      <path d="M11 20c-1 0-2-3-3-3" />
    </svg>
  );
}
