import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { MapPin, Ticket, CreditCard, Box, ChevronRight, ShieldCheck, MailPlus } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, writeBatch, collection, serverTimestamp } from 'firebase/firestore';
import { cn, formatRp } from '../lib/utils';

export function Checkout() {
  const { user, updateUser } = useAuth();
  const { cart, removeFromCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');
  
  const selectedItemIds: string[] = location.state?.selectedItemIds || [];
  
  useEffect(() => {
    if (!selectedItemIds || selectedItemIds.length === 0) {
      navigate('/cart');
    }
  }, [selectedItemIds, navigate]);

  const checkoutItems = cart.filter(item => selectedItemIds.includes(item.id));
  const subtotal = checkoutItems.reduce((acc, item) => acc + (item.price * 15000 * item.quantity), 0);
  const protectionFee = 5400; // Mock Rp5.400
  
  // Dynamic Shipping Calculation: Base 5000 + 2500 per item
  const shippingFee = 5000 + (checkoutItems.reduce((acc, item) => acc + item.quantity, 0) * 2500);
  const total = subtotal + protectionFee + shippingFee;

  const hasAddress = user?.address && user.address.trim().length > 10;

  const handlePlaceOrder = async () => {
    if (!user) return;
    
    if (!hasAddress) {
      (window as any).addNotification('Silakan lengkapi alamat pengiriman di profil Anda sebelum memesan.', 'error');
      navigate('/profile');
      return;
    }

    setIsProcessing(true);
    (window as any).addNotification('Memproses arsip pesanan...', 'info');
    
    try {
      const batch = writeBatch(db);
      
      const orderRef = doc(collection(db, 'orders'));
      const orderData = {
        userId: user.id,
        customerName: user.fullName || 'Rafael Gultom',
        customerPhone: user.phoneNumber || '811 9410 609',
        shippingAddress: user.address,
        message: orderMessage,
        items: checkoutItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.images[0]
        })),
        subtotal,
        protectionFee,
        shippingFee,
        total,
        status: 'PROSES',
        paymentMethod: 'COD',
        createdAt: serverTimestamp()
      };
      
      batch.set(orderRef, orderData);
      
      let totalQuantityBought = 0;
      checkoutItems.forEach((item) => {
        totalQuantityBought += item.quantity;
        if (item.id.length > 5) {
          const productRef = doc(db, 'products', item.id);
          batch.update(productRef, {
            stock: item.stock - item.quantity
          });
        }
      });

      await batch.commit();

      if (user) {
        await updateUser({ purchasedCount: (user.purchasedCount || 0) + totalQuantityBought });
      }

      selectedItemIds.forEach(id => removeFromCart(id));
      setIsProcessing(false);
      (window as any).addNotification('Pesanan berhasil dibuat!', 'success');
      navigate('/orders', { replace: true });

    } catch (error) {
      console.error("Error during checkout:", error);
      setIsProcessing(false);
      (window as any).addNotification('Gagal memproses pesanan', 'error');
    }
  };

  if (checkoutItems.length === 0) return null;

  return (
    <div className="min-h-screen pt-24 pb-32 bg-[#f5f5f5] text-sm text-[#222]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-0 space-y-6">
        
        {/* Lungsurin style dashed border */}
        <div className="bg-white border text-[#222] shadow-[0_2px_4px_rgba(0,0,0,0.05)] rounded-sm relative overflow-hidden">
          <div className="h-1.5 w-full bg-[repeating-linear-gradient(45deg,#000,#000_15px,#fff_15px,#fff_25px,#ff4d4d_25px,#ff4d4d_40px,#fff_40px,#fff_50px)]" />
          
          <div className="p-4 md:p-6">
            <div className="flex items-center gap-2 text-primary-950 font-black uppercase tracking-widest text-sm mb-4">
              <MapPin size={16} strokeWidth={3} className="text-primary-500" />
              Alamat Pengiriman
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
              <div className="font-extrabold flex-shrink-0 text-sm">
                {user?.fullName || 'Rafael Gultom'} (+62) {user?.phoneNumber || '811 9410 609'}
              </div>
              <div className={cn(
                "flex-1 font-medium text-xs leading-relaxed",
                hasAddress ? "text-primary-950/70" : "text-[#D0021B] italic font-black"
              )}>
                {hasAddress ? user?.address : 'ALAMAT BELUM DISET. SILAKAN KLIK UBAH UNTUK MELENGKAPI DATA.'}
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                {hasAddress && <span className="bg-black text-white px-2 py-0.5 text-[9px] uppercase font-black">Utama</span>}
                <button 
                  onClick={() => navigate('/profile')}
                  className="text-primary-500 font-bold uppercase text-[9px] tracking-widest cursor-pointer hover:underline"
                >
                  Ubah
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product List */}
        <div className="bg-white border shadow-[0_2px_4px_rgba(0,0,0,0.05)] rounded-sm overflow-hidden">
          <div className="p-4 md:p-6">
            <div className="hidden md:flex items-center text-primary-950/40 mb-6 pb-2 font-black uppercase tracking-[0.2em] text-[9px]">
              <div className="flex-1 text-sm text-primary-950 font-black tracking-normal normal-case">Produk Dipesan</div>
              <div className="w-32 text-center">Harga Satuan</div>
              <div className="w-24 text-center">Jumlah</div>
              <div className="w-40 text-right">Subtotal Produk</div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 font-black uppercase tracking-wider text-[11px]">
                <span className="bg-[#D0021B] text-white text-[8px] px-1 py-0.5 font-black uppercase">Terverifikasi</span>
                <span className="text-primary-950">Lungsurin Mitra</span>
              </div>

              {checkoutItems.map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row items-center gap-4 py-2">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 border border-primary-950/10 flex-shrink-0">
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="line-clamp-1 font-bold text-sm text-primary-950">{item.name}</span>
                      <span className="text-[#D0021B] mt-1 block text-[9px] font-black uppercase">Variasi: {item.category || 'Fashion'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between w-full md:w-auto md:gap-0 mt-4 md:mt-0 font-bold">
                    <div className="w-32 text-center text-primary-950 font-black text-sm">
                      {formatRp(item.price * 15000)}
                    </div>
                    <div className="w-24 text-center text-primary-950 font-black text-sm">
                      {item.quantity}
                    </div>
                    <div className="w-40 text-right font-black text-primary-950 text-sm">
                      {formatRp(item.price * 15000 * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="border-t border-[#F5F5F5] pt-6 flex flex-col gap-px bg-[#F5F5F5]">
                {/* Proteksi Kerusakan */}
                <div className="bg-[#FFFDF8] p-4 flex flex-col md:flex-row md:items-center border border-[#F9F1E7]">
                   <div className="flex items-center gap-3 flex-1">
                     <div className="w-5 h-5 border-2 border-black flex items-center justify-center bg-black">
                        <div className="w-2.5 h-1.5 border-b-2 border-l-2 border-white -rotate-45 -translate-y-0.5" />
                     </div>
                     <div className="flex items-center gap-2">
                       <ShieldCheck className="text-primary-950" size={16} strokeWidth={2.5} />
                       <span className="font-bold text-xs">Proteksi Ekstra +</span>
                       <span className="bg-[#D0021B] text-white text-[8px] px-1 py-0.5 uppercase font-black">Baru</span>
                     </div>
                   </div>
                   <div className="flex items-center justify-between w-full md:w-auto mt-2 md:mt-0 font-bold">
                      <div className="w-32 text-center text-[11px] font-black">Rp2.700</div>
                      <div className="w-24 text-center text-[11px] font-black">2</div>
                      <div className="w-40 text-right text-[11px] font-black">Rp5.400</div>
                   </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center border-t border-[#F5F5F5] mt-6 pt-0 gap-0">
                <div className="flex items-center gap-3 w-full md:w-[350px] pr-6 px-4 h-full py-6 border-r border-[#F5F5F5]">
                   <span className="text-primary-950 font-bold uppercase text-[9px] tracking-tight shrink-0">Pesan:</span>
                   <input 
                    type="text" 
                    placeholder="(Opsional) Tinggalkan pesan" 
                    value={orderMessage}
                    onChange={(e) => setOrderMessage(e.target.value)}
                    className="border border-[#F5F5F5] px-3 py-2 w-full focus:outline-none font-medium text-[11px]" 
                   />
                </div>
                <div className="flex-1 flex flex-col justify-center px-6 h-full py-6">
                   <div className="flex items-start justify-between w-full">
                      <span className="font-bold text-primary-950 uppercase text-[9px] tracking-tight shrink-0 mt-1">Opsi Pengiriman:</span>
                      <div className="flex flex-col flex-1 pl-12 relative">
                         <div className="flex justify-between items-center">
                            <span className="font-black text-primary-950 text-[13px] uppercase tracking-wide">Hemat Kargo</span>
                            <span className="text-[#D0021B] font-bold uppercase text-[9px] cursor-pointer hover:underline absolute right-12 top-0.5" onClick={() => (window as any).addNotification('Hanya tersedia pengiriman reguler hemat saat ini.', 'info')}>Ubah</span> 
                            <span className="font-black text-[13px] ml-auto">{formatRp(shippingFee)}</span>
                         </div>
                         <span className="text-[#D0021B] font-bold text-[9px] uppercase tracking-tight mt-1">Estimasi tiba 3 - 5 Hari</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Totals Section */}
        <div className="bg-white border shadow-[0_2px_4px_rgba(0,0,0,0.05)] rounded-sm p-8 flex flex-col items-end gap-6">
          <div className="flex items-baseline gap-4 w-full justify-end">
            <span className="text-primary-950/60 font-bold uppercase text-[10px] tracking-widest">Total Pesanan ({checkoutItems.length} Produk):</span>
            <span className="text-xl font-black text-[#D0021B]">{formatRp(total)}</span>
          </div>
          <button 
            onClick={handlePlaceOrder}
            disabled={isProcessing}
            className="bg-[#D0021B] text-white px-16 py-4 font-black uppercase tracking-[0.2em] text-sm hover:opacity-90 transition-all border-none min-w-[280px] shadow-[0_4px_10px_rgba(208,2,27,0.2)]"
          >
            {isProcessing ? 'Memproses...' : 'Buat Pesanan'}
          </button>
        </div>

      </div>
    </div>
  );
}
