import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, ShoppingBag, Leaf, HelpCircle, X, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

interface AIChatbotProps {
  variant?: 'floating' | 'inline';
}

export function AIChatbot({ variant = 'floating' }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(variant === 'inline');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: "Halo! Saya Lungsurin AI, asisten keberlanjutan pribadi Anda. Ada yang bisa saya bantu?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const intent = params.get('intent');
    const item = params.get('item');
    
    if (intent && item && !initialized) {
      setInitialized(true);
      setIsOpen(true);
      
      const msg = `Saya baru saja menganalisis "${item}" saya dan rekomendasinya adalah ${intent.toUpperCase()}. Bisakah Anda memberi saya panduan langkah demi langkah tentang cara melakukannya?`;
      
      setMessages(prev => [
        ...prev, 
        { role: 'user', content: msg }
      ]);
      
      setIsTyping(true);
      
      // Auto trigger AI response
      const fetchResponse = async () => {
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
              { role: 'user', parts: [{ text: `Anda adalah Lungsurin AI, asisten AI untuk Lungsurin, ekosistem fashion berkelanjutan. Jawab pertanyaan pengguna dalam bahasa Indonesia tentang keberlanjutan, daur ulang (upcycling), atau pasar sirkular kami. Tetaplah ramah dan ringkas. Pengguna mengatakan: ${msg}` }] }
            ]
          });
          setMessages(prev => [...prev, { role: 'bot', content: response.text || `Tentu! Berikut adalah tutorial sederhana tentang cara melakukan ${intent} pada item Anda...` }]);
        } catch (err) {
          console.error(err);
          setMessages(prev => [...prev, { role: 'bot', content: `Tentu! Daur ulang atau perbaikan adalah pilihan yang bagus. Untuk proyek ${intent}, mulailah dengan membersihkan pakaian secara menyeluruh, lalu kumpulkan perlengkapan menjahit dasar seperti jarum, benang yang senada dengan kain, dan gunting kain. Saya dapat memandu Anda langkah demi langkah jika Anda memberi tahu bagian spesifik mana yang ingin Anda kerjakan terlebih dahulu!` }]);
        } finally {
          setIsTyping(false);
        }
      };
      
      fetchResponse();
    }
  }, [location.search, initialized]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = 'gemini-2.5-flash';
      
      const response = await ai.models.generateContent({
        model,
        contents: [
          { role: 'user', parts: [{ text: `Anda adalah Lungsurin AI, asisten AI untuk Lungsurin, ekosistem fashion berkelanjutan. Jawab pertanyaan pengguna dalam bahasa Indonesia tentang keberlanjutan, daur ulang (upcycling), atau pasar sirkular kami. Tetaplah ramah dan ringkas. Pengguna mengatakan: ${userMsg}` }] }
        ]
      });

      setMessages(prev => [...prev, { role: 'bot', content: response.text || "Maaf, saya tidak bisa memprosesnya. Coba tanya tentang tips daur ulang!" }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'bot', content: "Saya sedang mengalami sedikit masalah koneksi saat ini. Namun secara umum, daur ulang adalah cara yang bagus untuk menghemat sumber daya!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const chatContent = (
    <div className={cn(
      "bg-white flex flex-col overflow-hidden",
      variant === 'floating' 
        ? "fixed bottom-24 right-6 md:bottom-28 md:right-10 z-[60] w-[calc(100vw-3rem)] md:w-[450px] h-[600px] rounded-[2.5rem] card-shadow border border-primary-50"
        : "w-full h-full rounded-[2rem] border border-black/5 card-shadow"
    )}>
      {/* Header */}
      <div className="p-8 bg-primary-500 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
            <Bot size={28} className="text-primary-200" />
          </div>
          <div>
            <h3 className="font-sans font-extrabold text-xl leading-none text-white tracking-tight">Lungsurin AI</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 bg-primary-300 rounded-full animate-pulse shadow-[0_0_10px_rgba(143,202,170,0.4)]"></span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-white/60">Ecosystem Assistant</span>
            </div>
          </div>
        </div>
        {variant === 'floating' && (
          <button 
            onClick={() => setIsOpen(false)}
            className="p-3 hover:bg-white/10 rounded-full transition-all hover:rotate-90"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-accent-cream/20"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={cn(
              "flex max-w-[85%] flex-col",
              msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <div className={cn(
              "p-5 rounded-[1.5rem] text-sm leading-relaxed shadow-sm",
              msg.role === 'user' 
                ? "bg-primary-500 text-white rounded-tr-none" 
                : "bg-white rounded-tl-none text-primary-950 border border-primary-50 font-medium"
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl w-fit card-shadow border border-primary-50">
             <div className="flex gap-1">
               <span className="w-1.5 h-1.5 bg-primary-300 rounded-full animate-bounce"></span>
               <span className="w-1.5 h-1.5 bg-primary-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
               <span className="w-1.5 h-1.5 bg-primary-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
             </div>
          </div>
        )}
      </div>

      {/* Suggested Actions */}
      <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar border-t border-primary-50">
         <button onClick={() => setInput('Show me the top sellers')} className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-900 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap border border-primary-100 hover:bg-primary-100 transition-colors">
           <ShoppingBag size={14} />
           Top Sellers
         </button>
         <button onClick={() => setInput('How does AI analysis work?')} className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-900 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap border border-primary-100 hover:bg-primary-100 transition-colors">
           <Sparkles size={14} />
           Analysis Lab
         </button>
         <button onClick={() => setInput('Tell me about rewards')} className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-900 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap border border-primary-100 hover:bg-primary-100 transition-colors">
           <HelpCircle size={14} />
           Rewards
         </button>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-primary-50">
        <div className="relative group">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Talk to Lungsurin AI..."
            className="w-full pl-6 pr-14 py-4 bg-primary-50/50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary-500 transition-all font-medium text-sm"
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-primary-900 text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary-900/20"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {variant === 'floating' && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-10 right-10 z-50 p-6 bg-primary-950 text-white rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 transition-all group"
        >
          <Bot size={32} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-primary-400 border-4 border-[#f0f4f1] rounded-full shadow-lg"></span>
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={variant === 'floating' ? { opacity: 0, scale: 0.9, y: 20 } : { opacity: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={variant === 'floating' ? { opacity: 0, scale: 0.9, y: 20 } : { opacity: 0 }}
            className={variant === 'inline' ? "w-full h-full" : undefined}
          >
            {chatContent}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
