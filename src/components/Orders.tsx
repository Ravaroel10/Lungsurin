import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { formatRp, cn } from '../lib/utils';
import { Package, Truck, CheckCircle, Clock, ChevronRight, Search } from 'lucide-react';
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
  items: OrderItem[];
  total: number;
  status: 'PROSES' | 'DIKIRIM' | 'SELESAI' | 'DIBATALKAN';
  createdAt: any;
  subtotal: number;
  shippingFee: number;
  protectionFee: number;
}

export function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PROSES' | 'DIKIRIM' | 'SELESAI'>('ALL');

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
                            {item.quantity} x {formatRp(item.price * 15000)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-primary-950">{formatRp(item.price * 15000 * item.quantity)}</p>
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
                       <button className="bg-primary-950 text-white px-6 py-3 font-black uppercase tracking-widest text-[10px] hover:bg-primary-500 transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none">
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
    </div>
  );
}
