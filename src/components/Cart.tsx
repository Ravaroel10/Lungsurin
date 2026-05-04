import React, { useMemo, useState } from 'react';
import { Minus, Plus, Trash2, ArrowRight, MessageCircle, Store, Ticket, ChevronDown, Check, HelpCircle, Truck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { cn, formatRp } from '../lib/utils';
import { USD_TO_IDR } from '../constants';
import { doc, writeBatch, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Group items by sellerId
  const groupedCart = useMemo(() => {
    const groups: Record<string, typeof cart> = {};
    cart.forEach(item => {
      const seller = item.sellerId || 'Unknown Seller';
      if (!groups[seller]) groups[seller] = [];
      groups[seller].push(item);
    });
    return groups;
  }, [cart]);

  // Handle selections
  const toggleItem = (id: string) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSeller = (sellerId: string) => {
    const sellerItems = groupedCart[sellerId] || [];
    const allSelected = sellerItems.every(item => selectedItemIds.has(item.id));
    
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      sellerItems.forEach(item => {
        if (allSelected) next.delete(item.id);
        else next.add(item.id);
      });
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedItemIds.size === cart.length && cart.length > 0) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(cart.map(i => i.id)));
    }
  };

  const selectedCount = selectedItemIds.size;
  const selectedTotal = cart
    .filter(item => selectedItemIds.has(item.id))
    .reduce((sum, item) => sum + (item.price * USD_TO_IDR * item.quantity), 0);

  const handleBuyNow = () => {
    if (selectedItemIds.size === 0) return;
    navigate('/checkout', { state: { selectedItemIds: Array.from(selectedItemIds) } });
  };

  const getSellerName = (sellerId: string) => {
    const mapping: Record<string, string> = {
      'seller1': 'AvriliaMusik',
      'seller2': 'cse.shop',
      'Unknown Seller': 'Lungsurin Official'
    };
    return mapping[sellerId] || `Store ${sellerId.substring(0, 4)}`;
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-48 flex flex-col items-center justify-center space-y-8 bg-primary-50">
        <div className="w-32 h-32 text-primary-200">
           <Store size={128} strokeWidth={1} />
        </div>
        <h1 className="text-2xl md:text-4xl font-serif font-black text-primary-950">Keranjang Belanja Anda Kosong</h1>
        <Link to="/" className="px-8 py-3 bg-primary-950 text-white font-bold uppercase tracking-widest text-xs hover:bg-primary-800 transition-colors shadow-lg">
          Belanja Sekarang
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-48 bg-primary-50 text-sm text-primary-950 font-sans">
      <div className="max-w-[1200px] mx-auto px-4 md:px-0 space-y-4">
        
        {/* Cart Header Rows */}
        <div className="hidden md:flex bg-white px-5 py-4 border-2 border-primary-950 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-primary-900 font-bold uppercase tracking-wider text-xs">
          <div className="flex items-center gap-4 w-5/12">
            <div 
              className={cn("w-5 h-5 flex items-center justify-center border-2 cursor-pointer transition-colors", selectedItemIds.size === cart.length && cart.length > 0 ? "bg-primary-950 border-primary-950 text-white" : "border-primary-300 bg-white")}
              onClick={toggleAll}
            >
              <Check size={14} className={selectedItemIds.size === cart.length && cart.length > 0 ? "opacity-100" : "opacity-0"} strokeWidth={3} />
            </div>
            <span>Produk</span>
          </div>
          <div className="w-7/12 flex text-center">
            <div className="w-1/4">Harga Satuan</div>
            <div className="w-1/4">Kuantitas</div>
            <div className="w-1/4">Total Harga</div>
            <div className="w-1/4">Aksi</div>
          </div>
        </div>

        {/* Grouped Cart Items */}
        {Object.entries(groupedCart).map(([sellerId, items]) => {
          const sellerName = getSellerName(sellerId);
          const isSellerSelected = items.every(item => selectedItemIds.has(item.id));

          return (
            <div key={sellerId} className="bg-white border-2 border-primary-950 shadow-[4px_4px_0px_rgba(0,0,0,1)] mb-4">
              {/* Seller Header */}
              <div className="px-5 py-4 flex items-center gap-3 border-b-2 border-primary-950">
                <div 
                  className={cn("w-5 h-5 flex items-center justify-center border-2 cursor-pointer shrink-0 transition-colors", isSellerSelected ? "bg-primary-950 border-primary-950 text-white" : "border-primary-300 bg-white")}
                  onClick={() => toggleSeller(sellerId)}
                >
                  <Check size={14} className={isSellerSelected ? "opacity-100" : "opacity-0"} strokeWidth={3} />
                </div>
                <div className="bg-primary-500 text-white text-[10px] px-1.5 py-0.5 font-bold uppercase tracking-wider">Terverifikasi</div>
                <span className="font-black uppercase tracking-wide">{sellerName}</span>
                <MessageCircle size={16} className="text-primary-950 ml-1 cursor-pointer" fill="currentColor" />
              </div>

              {/* Items */}
              {items.map(item => {
                const isSelected = selectedItemIds.has(item.id);
                const priceRp = item.price * USD_TO_IDR;

                return (
                  <div key={item.id} className="p-5 flex flex-col md:flex-row gap-4 border-b border-primary-100 last:border-0 relative group">
                    <div className="flex items-start gap-4 md:w-5/12">
                      <div 
                        className={cn("w-5 h-5 flex items-center justify-center border-2 cursor-pointer shrink-0 mt-6 transition-colors", isSelected ? "bg-primary-950 border-primary-950 text-white" : "border-primary-300 bg-white")}
                        onClick={() => toggleItem(item.id)}
                      >
                        <Check size={14} className={isSelected ? "opacity-100" : "opacity-0"} strokeWidth={3} />
                      </div>
                      <div className="w-20 h-20 border-2 border-primary-950 shrink-0 bg-primary-50">
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex flex-col gap-1 pr-2 w-full">
                        <span className="line-clamp-2 leading-tight font-bold">{item.name}</span>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 font-bold uppercase tracking-wider">BEBAS EMISI</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center w-full md:w-7/12 gap-4 md:gap-0 mt-4 md:mt-0">
                      {/* Variation Info (Mock) */}
                      <div className="md:w-1/4 text-primary-500 cursor-pointer flex flex-col items-start pr-2 group/var">
                        <div className="flex items-center gap-1 text-[13px]">
                          <span className="font-bold uppercase text-[10px] tracking-wider">Variasi:</span>
                          <ChevronDown size={14} />
                        </div>
                        <span className="text-[13px] line-clamp-2 md:group-hover/var:line-clamp-none font-medium">{item.category || 'Standard'}</span>
                      </div>

                      {/* Unit Price */}
                      <div className="md:w-1/4 text-center hidden md:block">
                        <span className="font-bold">{formatRp(priceRp)}</span>
                      </div>

                      {/* Quantity Control */}
                      <div className="md:w-1/4 flex flex-col items-center justify-center">
                        <div className="flex items-center border-2 border-primary-950 bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                          <button 
                            className="w-8 h-8 flex items-center justify-center text-primary-950 hover:bg-primary-50 transition-colors border-r-2 border-primary-950"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus size={14} strokeWidth={3} />
                          </button>
                          <input 
                            type="text" 
                            className="w-10 h-8 text-center text-sm outline-none font-bold bg-white text-primary-950"
                            value={item.quantity}
                            readOnly
                          />
                          <button 
                            className="w-8 h-8 flex items-center justify-center text-primary-950 hover:bg-primary-50 transition-colors border-l-2 border-primary-950 disabled:opacity-30 disabled:bg-gray-100"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus size={14} strokeWidth={3} />
                          </button>
                        </div>
                        <span className="text-[10px] font-bold text-primary-500 tracking-wider uppercase mt-2 text-center">Tersisa {item.stock}</span>
                      </div>

                      {/* Subtotal */}
                      <div className="md:w-1/4 flex justify-between md:justify-center items-center">
                        <span className="md:hidden font-bold uppercase text-[10px] tracking-wider text-primary-500">Subtotal:</span>
                        <span className="text-primary-950 font-black text-lg">{formatRp(priceRp * item.quantity)}</span>
                      </div>

                      {/* Actions */}
                      <div className="md:w-1/4 flex flex-row md:flex-col items-center justify-center gap-4 md:gap-2 mt-4 md:mt-0">
                        <button 
                          className="hover:text-primary-500 transition-colors font-bold uppercase text-xs tracking-wider border-b-2 border-transparent hover:border-primary-500"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Hapus
                        </button>
                        <button className="text-primary-500 hover:text-primary-950 flex items-center gap-1 group/sim font-bold uppercase text-[10px] tracking-wider transition-colors">
                          Produk Serupa
                          <ChevronDown size={14} className="group-hover/sim:rotate-180 transition-transform" strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Seller Footer Addons */}
              <div className="border-t-2 border-primary-100 bg-primary-50/50">
                <div className="px-5 py-4 border-b border-primary-100 flex items-center gap-2 cursor-pointer hover:bg-primary-100 transition-colors">
                  <Ticket size={20} className="text-primary-950" />
                  <span className="text-primary-950 font-bold uppercase text-xs tracking-wider">Gunakan Voucher Mitra Lungsurin</span>
                </div>
                <div className="px-5 py-4 flex items-center gap-2 flex-wrap">
                  <div className="bg-primary-950 text-white text-[10px] px-1.5 py-0.5 font-bold uppercase flex items-center tracking-wider"><Truck size={12} className="mr-1" strokeWidth={3}/> Ekspedisi Hijau</div>
                  <span className="text-primary-700 text-sm font-medium">Bebas Ongkir s/d Rp25.000 dengan min. belanja Rp0</span>
                  <span className="text-primary-950 font-bold text-xs uppercase tracking-wider cursor-pointer ml-1 hover:underline">Pelajari lebih lanjut</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-primary-950 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-40">
        {/* Global Promos Bar */}
        <div className="max-w-[1200px] mx-auto border-b-2 border-primary-100 bg-primary-50">
          <div className="flex flex-col md:flex-row md:items-center justify-end px-5 py-3 md:py-4 gap-4 md:gap-8">
            <div className="flex items-center gap-2 justify-between md:justify-start w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Ticket size={24} className="text-primary-950" />
                <span className="font-black uppercase tracking-wider text-sm">Voucher Lungsurin</span>
              </div>
              <span className="text-primary-500 font-bold underline cursor-pointer hidden md:block text-xs uppercase tracking-wider">Pilih / Masukkan Kode</span>
            </div>
            <div className="flex items-center gap-2 justify-between md:justify-start w-full md:w-auto text-primary-400 opacity-50 pointer-events-none">
               <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-primary-200 text-primary-950 flex items-center justify-center rounded-full text-[10px] font-black italic">L</div>
                  <span className="font-black uppercase tracking-wider text-sm">Poin Lungsurin</span>
               </div>
               <span className="text-xs font-bold">Tidak ada produk</span>
               <HelpCircle size={14} />
               <span className="font-bold">-Rp0</span>
            </div>
          </div>
        </div>

        {/* Action & Checkout Bar */}
        <div className="max-w-[1200px] mx-auto px-5 h-auto md:h-20 flex flex-col md:flex-row md:items-center justify-between gap-y-4 py-4 md:py-0">
          {/* Left Actions */}
          <div className="flex items-center gap-4 text-[13px] md:text-sm overflow-x-auto whitespace-nowrap pb-2 md:pb-0 hide-scrollbar scrollbar-hide">
            <div className="flex items-center gap-3 cursor-pointer shrink-0 font-bold uppercase tracking-wider text-xs" onClick={toggleAll}>
              <div className={cn("w-5 h-5 flex items-center justify-center border-2 overflow-hidden transition-colors", selectedItemIds.size === cart.length && cart.length > 0 ? "bg-primary-950 border-primary-950 text-white" : "border-primary-300 bg-white")}>
                <Check size={14} className={selectedItemIds.size === cart.length && cart.length > 0 ? "opacity-100" : "opacity-0"} strokeWidth={3} />
              </div>
              Pilih Semua ({cart.length})
            </div>
            <button className="hover:text-primary-500 transition-colors shrink-0 font-bold uppercase tracking-wider text-xs" onClick={() => {
              selectedItemIds.forEach(id => removeFromCart(id));
              setSelectedItemIds(new Set());
            }}>Hapus</button>
            <button className="hover:text-primary-500 transition-colors shrink-0 font-bold uppercase tracking-wider text-xs">Hapus Non-Aktif</button>
            <button className="text-primary-950 border-b-2 border-primary-950 hover:bg-primary-50 px-2 py-1 transition-colors shrink-0 font-bold uppercase tracking-wider text-xs">Pindahkan ke Arsip</button>
          </div>

          {/* Right Checkout */}
          <div className="flex items-center justify-between md:justify-end md:gap-6 w-full md:w-auto shrink-0 border-t-2 border-primary-100 md:border-none pt-4 md:pt-0">
            <div className="flex flex-col items-end mr-4 md:mr-0 shrink-0">
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline font-bold uppercase tracking-wider text-xs text-primary-500">Total ({selectedCount}):</span>
                <span className="inline sm:hidden font-bold uppercase tracking-wider text-xs text-primary-500">Total:</span>
                <span className="text-primary-950 text-2xl md:text-3xl font-black">{formatRp(selectedTotal)}</span>
              </div>
            </div>
            <button 
              onClick={handleBuyNow}
              disabled={selectedCount === 0 || isProcessing}
              className={cn(
                "px-8 md:px-12 py-3 md:py-4 transition-all text-white font-black uppercase tracking-widest text-sm shrink-0 border-2",
                selectedCount > 0 
                  ? "bg-primary-950 border-primary-950 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[0px_0px_0px_rgba(0,0,0,1)]" 
                  : "bg-gray-300 border-gray-300 text-gray-400 cursor-not-allowed"
              )}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
      
      {/* Floating Chat Box Mock */}
      <div className="fixed bottom-32 right-4 z-[60] hidden md:block">
        <div className="bg-primary-950 text-white px-5 py-3 border-2 border-primary-950 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 cursor-pointer font-black uppercase tracking-widest text-xs">
           <MessageCircle size={20} fill="currentColor" />
           <span>Konsultasi AI</span>
        </div>
      </div>

    </div>
  );
}
