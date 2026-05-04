import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_PRODUCTS } from '../lib/mockData';
import { useCart } from '../contexts/CartContext';
import { cn } from '../lib/utils';

export function Favorites() {
  const { user, updateUser } = useAuth();
  const { addToCart } = useCart();
  
  const favoriteProducts = MOCK_PRODUCTS.filter(p => user?.favorites.includes(p.id));

  const removeFavorite = (id: string) => {
    if (!user) return;
    const newFavs = user.favorites.filter(favId => favId !== id);
    updateUser({ favorites: newFavs });
    (window as any).addNotification('Item dihapus dari kurasi.', 'info');
  };

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
    (window as any).addNotification(`${product.name} ditambahkan ke arsip.`, 'success');
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-48 flex flex-col items-center justify-center bg-primary-50 px-4">
        <h1 className="text-4xl font-display font-black uppercase text-primary-950 mb-4">Akses Ditolak</h1>
        <p className="text-primary-950/40 font-bold uppercase text-[10px] tracking-widest mb-8">Silakan login untuk mengakses arsip neural Anda.</p>
        <Link to="/login" className="px-10 py-4 bg-primary-950 text-white font-black uppercase text-xs tracking-widest">Protokol Login</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-32 bg-primary-50">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="mb-10 sm:mb-16 space-y-6 md:space-y-4 p-8 md:p-12 bg-white border-2 border-primary-950 bg-batik relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500 -translate-y-1/2 translate-x-1/2 rotate-45 border-b-2 border-primary-950" />
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 relative z-10">
            <span className="bg-primary-500 text-white text-[9px] md:text-[10px] font-black px-3 py-1 uppercase tracking-widest">Kurasi Neural</span>
            <div className="hidden md:block h-[1px] flex-1 bg-primary-950/10" />
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-display font-black uppercase tracking-tighter text-primary-950 leading-none relative z-10">
            Arsip <br /> <span className="text-primary-500">Tersimpan</span>
          </h1>
        </div>

        {favoriteProducts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border-2 border-primary-950 p-20 text-center space-y-8"
          >
            <Heart size={80} className="mx-auto text-primary-950/10" />
            <div className="space-y-2">
              <h2 className="text-3xl font-display font-black uppercase">Belum Ada Data</h2>
              <p className="text-primary-950/40 font-bold uppercase text-[10px] tracking-widest">Koleksi Anda saat ini masih kosong.</p>
            </div>
            <Link to="/marketplace" className="inline-block px-12 py-5 bg-primary-950 text-white font-black uppercase text-xs tracking-widest hover:bg-primary-500 transition-all">
              Inisialisasi Sinkronisasi Pasar
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            <AnimatePresence>
              {favoriteProducts.map((product) => (
                <motion.div 
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-white border-2 border-primary-950 group h-full flex flex-col"
                >
                  <div className="aspect-[4/5] relative overflow-hidden bg-primary-50 border-b-2 border-primary-950 shrink-0">
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <button 
                      onClick={() => removeFavorite(product.id)}
                      className="absolute top-4 right-4 w-10 h-10 bg-white border-2 border-primary-950 flex items-center justify-center text-primary-950 hover:bg-primary-500 hover:text-white transition-all z-20"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-primary-500 tracking-widest">{product.category}</p>
                      <h3 className="font-display font-black text-xl leading-tight text-primary-950 truncate uppercase">{product.name}</h3>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-display font-black text-primary-950">
                        ${product.price.toFixed(2)}
                      </span>
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="w-10 h-10 bg-primary-950 text-white flex items-center justify-center hover:bg-primary-500 transition-all"
                      >
                        <ShoppingBag size={18} />
                      </button>
                    </div>
                    
                    <Link 
                      to={`/product/${product.id}`}
                      className="flex items-center justify-between pt-4 border-t border-primary-950/10 text-[10px] font-black uppercase tracking-widest text-primary-950/60 hover:text-primary-500 transition-colors"
                    >
                      Analisis Lengkap <ArrowRight size={12} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
