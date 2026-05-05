import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { formatRp, cn } from '../lib/utils';
import { USD_TO_IDR } from '../constants';
import { Package, Truck, CheckCircle, Clock, ChevronRight, Search, MapPin, CreditCard, ShieldCheck, X, Copy, Info, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  userId: string;
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: string;
  message?: string;
  paymentMethod?: string;
  items: OrderItem[];
  total: number;
  status: 'PROSES' | 'DIKIRIM' | 'SELESAI' | 'DIBATALKAN';
  proofURL?: string;
  createdAt: any;
  subtotal: number;
  shippingFee: number;
  protectionFee: number;
  trackingNumber?: string;
}

export function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PROSES' | 'DIKIRIM' | 'SELESAI'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(fetchedOrders);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredOrders = orders.filter(o => activeTab === 'ALL' || o.status === activeTab);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PROSES': return <Clock className="text-amber-500" size={18} />;
      case 'DIKIRIM': return <Truck className="text-blue-500" size={18} />;
      case 'SELESAI': return <CheckCircle className="text-emerald-500" size={18} />;
      default: return <Package className="text-gray-400" size={18} />;
    }
  };

  const tabs = [
    { id: 'ALL', label: 'Semua' },
    { id: 'PROSES', label: 'Sedang Diproses' },
    { id: 'DIKIRIM', label: 'Dikirim' },
    { id: 'SELESAI', label: 'Selesai' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-950 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 pt-32 pb-40">
      <div className="max-w-4xl mx-auto px-4 md:px-0">
        <div className="mb-12 space-y-4">
          <h1 className="text-5xl font-display font-black uppercase tracking-tight text-primary-950">Lacak <span className="text-primary-500">Arsip</span></h1>
          <p className="text-primary-900/60 font-medium max-w-md">Pantau perjalanan item sirkular Anda dari kurasi hingga ke tangan Anda.</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white border-2 border-primary-950 shadow-[4px_4px_0px_rgba(0,0,0,1)] mb-8 overflow-x-auto no-scrollbar scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 px-6 py-4 font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all whitespace-nowrap border-r-2 border-primary-950 last:border-r-0",
                activeTab === tab.id ? "bg-primary-950 text-white" : "text-primary-950 hover:bg-primary-50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-primary-950 p-12 text-center shadow-[4px_4px_0px_rgba(0,0,0,1)]"
              >
                <div className="w-16 h-16 bg-primary-50 rounded-none border-2 border-primary-950 flex items-center justify-center mx-auto mb-6">
                  <Search size={32} className="text-primary-950" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-widest text-primary-950 mb-2">Belum ada arsip</h3>
                <p className="text-primary-900/50 font-medium">Anda belum memiliki pesanan dengan status ini.</p>
              </motion.div>
            ) : (
              filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border-2 border-primary-950 shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="px-6 py-4 bg-primary-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white text-primary-950">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Order ID</p>
                        <p className="font-mono text-sm leading-none">{order.id.toUpperCase().slice(0, 12)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</p>
                        <div className="flex items-center gap-1.5 font-black uppercase text-[11px] tracking-widest justify-end">
                           <div className={cn(
                             "w-2 h-2 rounded-full animate-pulse",
                             order.status === 'PROSES' ? "bg-amber-400" : 
                             order.status === 'DIKIRIM' ? "bg-blue-400" : "bg-emerald-400"
                           )} />
                           {order.status}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6 space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center">
                        <div className="w-16 h-16 border-2 border-primary-950 bg-primary-50 flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black uppercase tracking-tight text-sm truncate">{item.name}</h4>
                          <p className="text-xs font-bold text-primary-500 uppercase tracking-widest mt-1">
                            {item.quantity} x {formatRp(item.price * USD_TO_IDR)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-primary-950">{formatRp(item.price * USD_TO_IDR * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="px-6 py-4 bg-primary-50 border-t-2 border-primary-950 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-xs font-bold text-primary-900/60 uppercase tracking-widest">
                       <span>Pemesanan: {order.createdAt?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-8">
                       <div className="text-right">
                         <span className="text-[10px] font-black uppercase tracking-widest text-primary-400 block mb-1">Total Pesanan</span>
                         <span className="text-2xl font-black text-primary-950">{formatRp(order.total || (order.subtotal + order.protectionFee + order.shippingFee))}</span>
                       </div>
                       <button 
                         onClick={() => setSelectedOrder(order)}
                         className="bg-primary-950 text-white px-6 py-3 font-black uppercase tracking-widest text-[10px] hover:bg-primary-500 transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                       >
                         Detail Pesanan
                       </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white border-2 border-primary-950 shadow-[12px_12px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b-2 border-primary-950 bg-primary-950 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package size={24} />
                  <h3 className="text-xl font-display font-black uppercase tracking-tight">Detail <span className="text-primary-500">Arsip</span></h3>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-white/10 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                {/* Status Section */}
                <div className="flex flex-col sm:flex-row gap-6 p-6 bg-primary-50 border-2 border-primary-950">
                  <div className="flex-1 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary-400">Order ID</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-lg">{selectedOrder.id}</span>
                      <button className="text-primary-500 hover:text-primary-600">
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary-400">Status Pengiriman</p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedOrder.status)}
                      <span className="font-black uppercase tracking-widest text-primary-950">{selectedOrder.status}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline - Simplified */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-950">Status Perjalanan</h4>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-primary-950" />
                        <div className="w-0.5 flex-1 bg-primary-950" />
                      </div>
                      <div className="pb-4">
                        <p className="text-xs font-black uppercase tracking-widest">{selectedOrder.status === 'SELESAI' ? 'Arsip Diterima' : 'Sedang Diproses'}</p>
                        <p className="text-[10px] font-medium text-primary-900/50 mt-1">
                          {selectedOrder.createdAt?.toDate().toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                    {selectedOrder.status !== 'PROSES' && (
                       <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn("w-4 h-4 rounded-full", selectedOrder.status === 'DIKIRIM' ? "bg-primary-950" : "bg-primary-200")} />
                          {selectedOrder.status === 'SELESAI' && <div className="w-0.5 flex-1 bg-primary-950" />}
                        </div>
                        <div className="pb-4">
                          <p className="text-xs font-black uppercase tracking-widest">Diserahkan ke Kurir</p>
                          {selectedOrder.trackingNumber && (
                             <p className="text-[10px] font-medium text-primary-900/50 mt-1">No. Resi: {selectedOrder.trackingNumber}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-primary-500" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-950">Alamat Pengiriman</h4>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-primary-950">{selectedOrder.customerName}</p>
                      <p className="text-xs font-bold text-primary-900/60">{selectedOrder.customerPhone}</p>
                      <p className="text-xs font-medium text-primary-950 leading-relaxed mt-2">
                        {selectedOrder.shippingAddress}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-primary-500" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-950">Pembayaran</h4>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-primary-950 uppercase tracking-widest">{selectedOrder.paymentMethod || 'COD'}</p>
                      <div className="flex items-center gap-2 mt-2 p-2 bg-primary-50 border border-primary-100 italic">
                        <Info size={12} className="text-primary-950" />
                        <p className="text-[10px] font-medium leading-tight">
                          {selectedOrder.paymentMethod === 'TRANSFER' ? 'Pembayaran telah diverifikasi via Bukti Transfer.' : 'Pastikan dana tersedia saat kurir tiba untuk metode COD.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedOrder.proofURL && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-500" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-950">Bukti Transfer</h4>
                    </div>
                    <div className="border-2 border-primary-950 bg-white p-2 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                       <img src={selectedOrder.proofURL} alt="Bukti Transfer" className="w-full max-h-[300px] object-contain" />
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Box size={16} className="text-primary-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-950">Items Dipesan</h4>
                  </div>
                  <div className="space-y-3 bg-white border-2 border-primary-950 p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center">
                        <div className="w-12 h-12 border-2 border-primary-950 flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black uppercase truncate">{item.name}</p>
                          <p className="text-[10px] font-bold text-primary-500 uppercase">{item.quantity} x {formatRp(item.price * USD_TO_IDR)}</p>
                        </div>
                        <p className="text-sm font-black">{formatRp(item.price * USD_TO_IDR * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-3 pt-4 border-t-2 border-dashed border-primary-950/20">
                   <div className="flex justify-between text-xs font-bold text-primary-900/60 uppercase tracking-widest">
                      <span>Subtotal Produk</span>
                      <span>{formatRp(selectedOrder.subtotal)}</span>
                   </div>
                   <div className="flex justify-between text-xs font-bold text-primary-900/60 uppercase tracking-widest">
                      <span>Ongkos Kirim</span>
                      <span>{formatRp(selectedOrder.shippingFee)}</span>
                   </div>
                   <div className="flex justify-between text-xs font-bold text-primary-900/60 uppercase tracking-widest">
                      <span>Biaya Proteksi</span>
                      <span>{formatRp(selectedOrder.protectionFee)}</span>
                   </div>
                   <div className="flex justify-between text-xl font-black text-primary-950 pt-2 border-t border-primary-950">
                      <span className="uppercase tracking-tighter">Total</span>
                      <span>{formatRp(selectedOrder.total)}</span>
                   </div>
                </div>

                {selectedOrder.message && (
                  <div className="p-4 bg-primary-50 border-2 border-primary-950">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary-400 mb-1">Catatan Pesanan</p>
                    <p className="text-xs font-medium italic">"{selectedOrder.message}"</p>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="p-6 bg-white border-t-2 border-primary-950 flex gap-4">
                <button 
                  onClick={() => navigate('/chat')}
                  className="flex-1 py-4 border-2 border-primary-950 font-black uppercase tracking-widest text-xs hover:bg-primary-50 transition-colors"
                >
                  Hubungi Seller
                </button>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-4 bg-primary-950 text-white font-black uppercase tracking-widest text-xs hover:bg-black transition-colors"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
