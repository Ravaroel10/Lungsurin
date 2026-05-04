import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Heart, ArrowLeft, ShoppingBag, ShieldCheck, Truck, RefreshCcw, Sparkles, 
  Share2, Star, Minus, Plus, MessageCircle, Store, ChevronRight
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { cn } from '../lib/utils';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { USD_TO_IDR } from '../constants';
import { SellerChat } from './SellerChat';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { user, updateUser } = useAuth();
  const { cart, addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<string>('Standard');
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isChatOpen, setIsChatOpen] = useState(window.location.hash === '#chat');

  useEffect(() => {
    if (window.location.hash === '#chat') {
      setIsChatOpen(true);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const docRef = doc(db, 'products', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProduct({ ...docSnap.data(), id: docSnap.id } as Product);
          }
        } catch (error) {
          console.error("Error fetching product:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchProduct();
  }, [id]);

  const toggleFavorite = () => {
    if (!user || !product) {
      (window as any).addNotification('Silakan login untuk mengkurasi barang.', 'info');
      return;
    }
    const isFav = user.favorites.includes(product.id);
    const newFavs = isFav 
      ? user.favorites.filter(id => id !== product.id)
      : [...user.favorites, product.id];
    updateUser({ favorites: newFavs });
    (window as any).addNotification(isFav ? 'Dihapus dari kurasi.' : 'Ditambahkan ke kurasi.', 'success');
  };

  const handleAddToCart = () => {
    if (!product) return;
    const existing = cart.find(item => item.id === product.id);
    if (existing && (existing.quantity + quantity) > product.stock) {
      (window as any).addNotification(`Stok maksimum tercapai untuk item ini.`, 'error');
      return;
    }
    addToCart(product, quantity);
    (window as any).addNotification(`${product.name} ditambahkan ke arsip.`, 'success');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 bg-primary-50">
        <div className="w-12 h-12 border-4 border-primary-950 border-t-transparent rounded-none animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-display font-black uppercase">Produk Tidak Ditemukan</h2>
          <Link to="/marketplace" className="bg-primary-950 text-white px-8 py-4 font-black uppercase">Kembali ke Pasar Sekunder</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pt-16 lg:pt-20 bg-[#F5F5F5] pb-20">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8 flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-primary-950/40 overflow-hidden">
        <Link to="/" className="hover:text-primary-950 transition-colors shrink-0">Lungsurin</Link>
        <ChevronRight size={10} className="shrink-0" />
        <Link to="/marketplace" className="hover:text-primary-950 transition-colors shrink-0">Pasar Sekunder</Link>
        <ChevronRight size={10} className="shrink-0" />
        <span className="text-primary-950 truncate">{product.name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Main Product Card */}
        <div className="bg-white border-2 border-primary-950/5 p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-6">
          
          {/* Left: Images & Social */}
          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-square bg-gray-50 border border-primary-950/5 relative group">
              <img 
                src={product.images[activeImage]} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {product.images.map((img, i) => (
                <button 
                  key={i}
                  onMouseEnter={() => setActiveImage(i)}
                  className={cn(
                    "w-20 h-20 shrink-0 border-2 transition-all",
                    activeImage === i ? "border-primary-500" : "border-transparent hover:border-primary-500/50"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-primary-950/5">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-black uppercase text-primary-950/60">Share:</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => (window as any).addNotification('Archive link copied to neural clipboard.', 'success')}
                    className="w-8 h-8 rounded-full border border-primary-950/10 flex items-center justify-center text-primary-950/60 hover:text-primary-500 transition-colors"
                  >
                    <Share2 size={14} />
                  </button>
                </div>
              </div>
              <button 
                onClick={toggleFavorite}
                className="flex items-center gap-2 group"
              >
                <Heart 
                  size={20} 
                  className={cn(
                    "transition-all",
                    user?.favorites.includes(product.id) ? "text-primary-500 fill-primary-500" : "text-primary-950/20 group-hover:text-primary-500"
                  )} 
                />
                <span className="text-xs font-black uppercase text-primary-950/80">Favorit (5.4RB)</span>
              </button>
            </div>
          </div>

          {/* Right: Details & Purchase */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h1 className="text-xl lg:text-2xl font-black text-primary-950 leading-tight">
                  {product.name}
                </h1>
              </div>

              <div className="flex items-center gap-4 text-sm divide-x divide-primary-950/20">
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="font-display font-black text-lg leading-none border-b-2 border-primary-500">5.0</span>
                  <div className="flex text-primary-500">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                </div>
                <div className="pl-4 flex flex-col justify-center">
                  <span className="font-display font-black text-lg leading-none">86</span>
                  <span className="text-primary-950/40 font-black uppercase text-[8px] tracking-widest mt-1">Penilaian</span>
                </div>
                <button className="pl-4 h-full text-primary-950/40 hover:text-primary-500 font-black uppercase text-[10px] tracking-widest transition-colors pt-1">
                  Laporkan
                </button>
              </div>
            </div>

            {/* Price Area */}
            <div className="bg-primary-950 p-6 md:p-8 space-y-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-32 h-32 border-4 border-white rotate-45 translate-x-16 -translate-y-16" />
              </div>
              <div className="flex items-center gap-4">
                {product.originalPrice && (
                  <>
                    <span className="text-white/20 line-through text-base md:text-lg font-display">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.originalPrice)}
                    </span>
                    <span className="bg-primary-500 text-white text-[10px] font-black px-2 py-1">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  </>
                )}
              </div>
              <div className="text-primary-100 text-3xl md:text-5xl font-display font-black tracking-tight">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}
              </div>
            </div>

            {/* Selection Options */}
            <div className="space-y-6 py-6 border-b border-primary-950/5">
              {/* Shipping Info */}
              <div className="flex gap-10">
                <span className="w-24 shrink-0 text-xs font-black uppercase text-primary-950/40">Pengiriman</span>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary-950">
                    <Truck size={16} className="text-emerald-600" />
                    <span>Jasa Kirim Toko</span>
                  </div>
                </div>
              </div>

              {/* Variants */}
              <div className="flex gap-10">
                <span className="w-24 shrink-0 text-xs font-black uppercase text-primary-950/40 pt-2">Varian</span>
                <div className="flex flex-wrap gap-2">
                  {['Merah', 'Hitam', 'Putih', 'Biru'].map(v => (
                    <button 
                      key={v}
                      onClick={() => setSelectedVariant(v)}
                      className={cn(
                        "px-4 py-2 text-xs font-black uppercase border transition-all",
                        selectedVariant === v ? "border-primary-500 text-primary-500 bg-primary-50/10 shadow-sm" : "border-primary-950/10 text-primary-950 hover:border-primary-500/50"
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kuantitas */}
              <div className="flex gap-10 items-center">
                <span className="w-24 shrink-0 text-xs font-black uppercase text-primary-950/40">Kuantitas</span>
                <div className="flex items-center border border-primary-950/10">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 border-r border-primary-950/10"
                  >
                    <Minus size={14} />
                  </button>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-16 h-10 text-center text-sm font-black focus:outline-none"
                  />
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 border-l border-primary-950/10"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="text-[10px] font-black uppercase text-primary-950/40">
                  {product.stock} Tersisa
                </div>
              </div>
            </div>

            {/* actions */}
            <div className="flex flex-col gap-4 pt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => {
                    handleAddToCart();
                    if (user && product && !user.favorites.includes(product.id)) {
                      const newFavs = [...user.favorites, product.id];
                      updateUser({ favorites: newFavs });
                    }
                  }}
                  className="w-full sm:flex-1 h-14 bg-primary-50 border-2 border-primary-500 text-primary-500 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-primary-100/30 transition-all"
                >
                  <ShoppingBag size={18} />
                  Masukkan Keranjang
                </button>
                <button 
                  onClick={() => {
                    if (user && product) {
                      if (!user.favorites.includes(product.id)) {
                        const newFavs = [...user.favorites, product.id];
                        updateUser({ favorites: newFavs, purchasedCount: (user.purchasedCount || 0) + quantity });
                      } else {
                        updateUser({ purchasedCount: (user.purchasedCount || 0) + quantity });
                      }
                      
                      // Add to cart temporarily if not already there, or just pass as a single item checkout
                      addToCart(product, quantity);
                      
                      (window as any).addNotification('Mengarahkan ke pembayaran...', 'info');
                      navigate('/checkout', { state: { selectedItemIds: [product.id] } });
                    } else {
                      (window as any).addNotification('Silakan login untuk membeli.', 'info');
                      navigate('/login');
                    }
                  }}
                  className="w-full sm:flex-[1.2] h-14 bg-primary-950 text-white font-black uppercase text-xs tracking-widest flex items-center justify-center hover:bg-primary-500 transition-all shadow-lg"
                >
                  Beli Sekarang
                </button>
              </div>
              <button 
                onClick={() => setIsChatOpen(true)}
                className="w-full h-14 border-2 border-primary-950 text-primary-950 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-primary-50 transition-all"
              >
                <MessageCircle size={18} />
                Pesan Langsung Penjual
              </button>
            </div>
          </div>
        </div>

        {/* Store Info Section */}
        <div className="bg-white border-2 border-primary-950 p-6 md:p-8 mb-6 rounded-none relative overflow-hidden bg-batik">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 -translate-y-1/2 translate-x-1/2 rotate-45 border-b border-l border-primary-950 hidden md:block" />
          
          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 relative z-10">
            <div className="w-full lg:w-auto flex items-center gap-4 md:gap-8 lg:border-r-2 border-primary-950 lg:pr-12">
              <div className="relative shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-primary-100 border-2 border-primary-950 flex items-center justify-center relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=200&h=200&auto=format&fit=crop" alt="Lungsurin Store" className="w-full h-full object-cover filter contrast-125" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 border-4 border-white/30" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-primary-500 text-white p-1 border-2 border-primary-950">
                  <ShieldCheck size={14} />
                </div>
              </div>
              
              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="font-display font-black text-xl md:text-2xl text-primary-950 leading-none">{product.sellerName || 'Lungsurin Archive'}</h3>
                  <p className="text-[9px] md:text-[10px] font-black uppercase text-primary-950/40 tracking-tighter mt-1">Official Authorized Node</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setIsChatOpen(true)}
                    className="px-4 md:px-6 py-2 bg-primary-950 text-white text-[9px] md:text-[10px] font-black uppercase flex items-center gap-2 hover:bg-primary-500 transition-all"
                  >
                    <MessageCircle size={14} /> Chat
                  </button>
                  <Link 
                    to="/marketplace"
                    className="px-4 md:px-6 py-2 bg-white border-2 border-primary-950 text-primary-950 text-[9px] md:text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-primary-950 hover:text-white transition-all"
                  >
                     Toko
                  </Link>
                </div>
              </div>
            </div>

            <div className="w-full lg:flex-1 grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-8 md:gap-y-10 md:gap-x-12">
              {[
                { label: 'Penilaian', value: '540', sub: 'High Reliability', color: 'text-primary-500' },
                { label: 'Persentase Chat Dibalas', value: '92%', sub: 'Real-time Sync', color: 'text-emerald-600' },
                { label: 'Bergabung', value: '23 bulan lalu', sub: 'Veteran Node', color: 'text-primary-950' },
                { label: 'Produk', value: '29', sub: 'Curated Archive', color: 'text-primary-950' },
                { label: 'Waktu Chat Dibalas', value: 'hitungan jam', sub: 'Low Latency', color: 'text-primary-500' },
                { label: 'Pengikut', value: '35RB', sub: 'Global Reach', color: 'text-primary-950' },
              ].map((stat, i) => (
                <div key={i} className="space-y-1 relative group">
                  <span className="text-[10px] font-black uppercase text-primary-950/30 tracking-widest block">{stat.label}</span>
                  <div className="flex items-baseline gap-2">
                    <span className={cn("text-2xl font-display font-black leading-none", stat.color)}>{stat.value}</span>
                  </div>
                  <div className="h-0.5 w-8 bg-primary-950 transition-all group-hover:w-full" />
                  <p className="text-[9px] font-bold text-primary-950/40 uppercase tracking-tighter">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Spesifikasi & Deskripsi Section */}
        <div className="bg-white border-2 border-primary-950/5 p-8 space-y-12">
          <div className="space-y-6">
            <h3 className="bg-[#FAFAFA] p-4 text-xs font-black uppercase tracking-[0.2em] text-primary-950">Spesifikasi Produk</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-4 max-w-4xl">
              {[
                { label: 'Kategori', value: 'Shopee > Marketplace > Circular Fashion' },
                { label: 'Merek', value: 'Lungsurin' },
                { label: 'Kondisi', value: 'Pre-owned / Upcycled' },
                { label: 'Negara Asal', value: 'Lokal' },
                { label: 'Masa Garansi', value: '1 Tahun' },
                { label: 'Stok', value: product.stock },
                { label: 'Dikirim Dari', value: 'DKI JAKARTA' },
              ].map((spec, i) => (
                <div key={i} className="flex gap-10">
                  <span className="w-32 shrink-0 text-xs font-black text-primary-950/30">{spec.label}</span>
                  <span className="text-xs font-bold text-primary-950 tracking-tight">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="bg-[#FAFAFA] p-4 text-xs font-black uppercase tracking-[0.2em] text-primary-950">Deskripsi Produk</h3>
            <div className="prose prose-sm max-w-none text-primary-950/80 leading-relaxed font-bold">
              <p>{product.description}</p>
              <br />
              <p className="uppercase text-[11px] font-black text-primary-950">Detail Produk:</p>
              <ol className="list-decimal pl-4 space-y-1 text-[10px] uppercase">
                <li>Kualitas terjamin dengan inspeksi AI Lungsurin.</li>
                <li>Material berkelanjutan hasil kurasi global.</li>
                <li>Mendukung sirkularitas fashion dan ekonomi mikro.</li>
                <li>Garansi 100% uang kembali jika tidak sesuai standar.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Ratings Section */}
        <div className="bg-white border-2 border-primary-950 p-6 md:p-12 mt-6 space-y-8 md:space-y-12">
          <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-primary-950 border-b-2 border-primary-950 pb-4 w-fit">Penilaian Produk</h3>
          
          <div className="bg-primary-50 border-2 border-primary-950 p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-16">
             <div className="text-center space-y-3 shrink-0">
                <div className="flex items-baseline justify-center gap-2">
                   <span className="text-4xl md:text-6xl font-display font-black text-primary-950">5.0</span>
                   <span className="text-[10px] md:text-xs font-black text-primary-950/40 uppercase tracking-widest">/ 5</span>
                </div>
                <div className="flex text-primary-500 justify-center scale-110 md:scale-125">
                   {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                </div>
             </div>
             <div className="flex flex-wrap gap-2 md:gap-3 justify-center md:justify-start">
                {[
                  'Semua', '5 Bintang (86)', '4 Bintang (0)', '3 Bintang (0)', 
                  '2 Bintang (0)', '1 Bintang (0)', 'Komentar (47)', 'Media (44)'
                ].map((filter, i) => (
                  <button key={i} className={cn(
                    "px-3 md:px-6 py-2 md:py-3 text-[9px] md:text-[10px] font-black uppercase border-2 transition-all tracking-widest",
                    i === 0 ? "bg-primary-950 border-primary-950 text-white shadow-lg" : "bg-white border-primary-950/10 text-primary-950 hover:border-primary-950"
                  )}>
                    {filter}
                  </button>
                ))}
             </div>
          </div>

          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-6 py-6 border-b border-primary-950/5 last:border-0">
               <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
               </div>
               <div className="space-y-2 flex-1">
                  <p className="text-[11px] font-black text-primary-950">user_archive_{i+1}</p>
                  <div className="flex text-primary-500">
                    {[...Array(5)].map((_, j) => <Star key={j} size={10} fill="currentColor" />)}
                  </div>
                  <p className="text-[10px] text-primary-950/40 uppercase font-bold">2026-04-27 08:50 | Variasi: {selectedVariant}</p>
                  <p className="text-xs font-bold text-primary-950 leading-relaxed mt-4">
                    Mantap sesuai ekspektasi. Pengiriman cepat dan materialnya benar-benar terasa premium meskipun upcycled. Lungsurin AI emang top.
                  </p>
                  <div className="flex gap-2 mt-4">
                     <div className="w-20 h-20 bg-gray-50 border border-primary-950/5">
                        <img src={product.images[0]} className="w-full h-full object-cover grayscale opacity-50" alt="" />
                     </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
      
      <SellerChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        storeName={product?.sellerName || "Lungsurin Archive"}
        sellerId={product?.sellerId}
      />
    </div>
  );
}
