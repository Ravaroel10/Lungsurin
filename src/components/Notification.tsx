import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Info, X } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export function Notification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Expose addNotification globally for easy access from other components
    (window as any).addNotification = (message: string, type: Notification['type'] = 'success') => {
      const id = Math.random().toString(36).substring(7);
      setNotifications(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 3000);
    };
  }, []);

  return (
    <div className="fixed bottom-32 right-12 z-[100] space-y-4">
      <AnimatePresence>
        {notifications.map(n => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-6 p-6 bg-white modular-border shadow-2xl min-w-[320px] border-l-4 border-l-primary-500"
          >
            {n.type === 'success' && <CheckCircle2 className="text-primary-500" size={24} />}
            {n.type === 'info' && <Info className="text-primary-900" size={24} />}
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-1 text-primary-500">{n.type}</p>
              <p className="text-sm font-medium tracking-widest text-primary-950">{n.message}</p>
            </div>
            <button 
              onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))}
              className="opacity-20 hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
