import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useChat } from '../contexts/ChatContext';

export function SellerChat({ isOpen, onClose, storeName }: { isOpen: boolean; onClose: () => void; storeName: string }) {
  const { addMessage, getChat } = useChat();
  const chatId = `seller_${storeName.replace(/\s+/g, '_').toLowerCase()}`;
  const currentChat = getChat(chatId);
  const messages = currentChat?.messages || [
    { id: 1, text: 'Halo! Ada yang bisa kami bantu seputar produk dari ' + storeName + '?', sender: 'seller', time: new Date(Date.now() - 60000) }
  ];
  
  const [inputMsg, setInputMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  // Initialize chat if it doesn't exist
  useEffect(() => {
    if (!currentChat) {
      addMessage(chatId, storeName, 'Halo! Ada yang bisa kami bantu seputar produk dari ' + storeName + '?', 'seller', 'bg-blue-100');
    }
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    
    // Add user message to global context
    addMessage(chatId, storeName, inputMsg, 'user', 'bg-blue-100');
    setInputMsg('');
    
    // Simulate seller response
    setTimeout(() => {
      addMessage(chatId, storeName, 'Baik, pesan Anda sudah kami terima. Admin kami akan segera membalasnya.', 'seller', 'bg-blue-100');
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-4 right-4 z-50 w-[300px] sm:w-[350px] md:w-[400px] bg-white border-2 border-primary-950 shadow-2xl flex flex-col"
          style={{ height: '450px', maxHeight: 'calc(100vh - 100px)' }}
        >
          {/* Header */}
          <div className="bg-primary-950 text-white p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 w-full pr-2">
              <div className="w-8 h-8 bg-white/10 flex items-center justify-center shrink-0">
                <Store size={16} />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-bold text-sm leading-tight truncate">{storeName}</span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Membalas dalam ±1 jam</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/10 transition-colors shrink-0">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-primary-50">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start')}>
                <div className={cn(
                  "px-4 py-2.5 text-sm leading-relaxed",
                  msg.sender === 'user' 
                    ? 'bg-primary-500 text-white font-medium' 
                    : 'bg-white border border-primary-950/10 text-primary-950 font-medium shadow-sm'
                )}>
                  {msg.text}
                </div>
                <span className="text-[9px] text-primary-950/40 uppercase font-black tracking-widest mt-1.5 px-1">
                  {msg.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t-2 border-primary-950 bg-white flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Tulis pesan..."
              className="flex-1 bg-primary-50/50 border border-primary-950/10 px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 transition-colors font-medium rounded-none"
            />
            <button 
              type="submit"
              disabled={!inputMsg.trim()}
              className="w-10 h-10 bg-primary-500 text-white flex items-center justify-center disabled:opacity-50 hover:bg-primary-900 transition-colors shrink-0"
            >
              <Send size={16} className="-ml-0.5" />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
