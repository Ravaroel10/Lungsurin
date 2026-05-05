import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Store, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, setDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

export function SellerChat({ isOpen, onClose, storeName, sellerId }: { isOpen: boolean; onClose: () => void; storeName: string; sellerId?: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputMsg, setInputMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate a consistent chatId between these two users
  const chatId = user && sellerId ? [user.id, sellerId].sort().join('_') : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isOpen || !chatId || !user) return;

    setIsLoading(true);
    
    // Ensure conversation document exists
    const ensureConversation = async () => {
      const convRef = doc(db, 'conversations', chatId);
      const convSnap = await getDoc(convRef);
      if (!convSnap.exists()) {
        await setDoc(convRef, {
          participants: [user.id, sellerId],
          otherPartyName: storeName, // This logic is simplified
          updatedAt: serverTimestamp(),
          lastMessage: ''
        });
      }
    };
    ensureConversation();

    const q = query(
      collection(db, 'conversations', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        time: (doc.data().createdAt as any)?.toDate() || new Date()
      }));
      setMessages(msgs);
      setIsLoading(false);
      setTimeout(scrollToBottom, 50);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `conversations/${chatId}/messages`);
    });

    return () => unsubscribe();
  }, [isOpen, chatId, user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !chatId || !user) return;
    
    const text = inputMsg;
    setInputMsg('');

    try {
      await addDoc(collection(db, 'conversations', chatId, 'messages'), {
        text,
        senderId: user.id,
        createdAt: serverTimestamp()
      });

      await setDoc(doc(db, 'conversations', chatId), {
        lastMessage: text,
        updatedAt: serverTimestamp()
      }, { merge: true });

    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-0 right-0 sm:bottom-4 sm:right-4 z-50 w-full sm:w-[350px] md:w-[400px] bg-white border-t-2 sm:border-2 border-primary-950 shadow-2xl flex flex-col"
          style={{ height: '500px', maxHeight: '100vh' }}
        >
          {/* Header */}
          <div className="bg-primary-950 text-white p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 w-full pr-2">
              <div className="w-8 h-8 bg-white/10 flex items-center justify-center shrink-0">
                <Store size={16} />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-bold text-sm leading-tight truncate">{storeName}</span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Online Now</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/10 transition-colors shrink-0">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-primary-50">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-primary-950/20" />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-40">
                <MessageCircle size={40} />
                <p className="text-[10px] font-black uppercase tracking-widest">Mulai percakapan dengan penjual</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.senderId === user?.id ? 'ml-auto items-end' : 'mr-auto items-start')}>
                  <div className={cn(
                    "px-4 py-2.5 text-sm leading-relaxed shadow-sm flex flex-col gap-2",
                    msg.senderId === user?.id 
                      ? 'bg-primary-900 text-white font-medium modular-border border-none' 
                      : 'bg-white border-2 border-primary-950/10 text-primary-950 font-medium'
                  )}>
                    {msg.image && (
                      <div className="w-full max-w-[240px] aspect-square rounded-sm overflow-hidden border border-black/10">
                        <img src={msg.image} alt="Bukti Transfer" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-primary-950/40 uppercase font-black tracking-widest mt-1.5 px-1 font-mono">
                    {msg.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t-2 border-primary-950 bg-white flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Kirim pesan ke penjual..."
              className="flex-1 bg-primary-50 border-2 border-primary-950/10 px-4 py-3 text-sm focus:outline-none focus:border-primary-950 transition-all font-medium rounded-none"
            />
            <button 
              type="submit"
              disabled={!inputMsg.trim() || !user}
              className="h-[46px] w-[46px] bg-primary-950 text-white flex items-center justify-center disabled:opacity-50 hover:bg-primary-500 transition-colors shrink-0 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
            >
              <Send size={18} />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
