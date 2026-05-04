import React from 'react';
import { AIChatbot } from './AIChatbot';
import { MessageSquare, Sparkles } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { cn } from '../lib/utils';

export function ChatPage() {
  const { chats } = useChat();

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 space-y-12 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-8 bg-primary-600" />
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Chat Ekosistem Global</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-primary-950">Pesan & Dukungan</h1>
          <p className="text-text-muted font-medium">Lihat riwayat percakapan Anda dengan penjual dan Lungsurin AI.</p>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-3 gap-8 min-h-0">
        {/* Contact List / Direct Messages */}
        <div className="hidden lg:flex flex-col gap-4 bg-white rounded-[2rem] p-8 card-shadow border border-black/5 overflow-y-auto no-scrollbar">
          <h3 className="text-xs font-black uppercase tracking-tighter text-text-muted mb-2">Saluran Internal</h3>
          
          <button 
            onClick={() => (window as any).addNotification('Kesadaran AI disinkronkan. Menunggu permintaan.', 'info')}
            className="flex items-center gap-4 p-4 bg-accent-tan/50 rounded-2xl border border-primary-100 text-primary-900 group"
          >
            <div className="w-12 h-12 bg-primary-900 text-white rounded-xl flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="font-bold text-sm truncate">Lungsurin AI</p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Aktif Sekarang</p>
            </div>
          </button>

          <h3 className="text-xs font-black uppercase tracking-tighter text-text-muted mt-4 mb-2">Pesan Langsung</h3>
          
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-40">
              <MessageSquare size={32} />
              <p className="text-xs font-bold uppercase tracking-widest">Belum ada pesan</p>
            </div>
          ) : (
            chats.map((chat) => (
              <button 
                key={chat.id} 
                onClick={() => (window as any).addNotification(`Membuka percakapan dengan ${chat.name}...`, 'info')}
                className="flex items-center gap-4 p-4 hover:bg-accent-cream rounded-2xl transition-colors border border-transparent hover:border-black/5"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-primary-900", chat.color)}>
                  {chat.name[0]}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <p className="font-bold text-sm truncate">{chat.name}</p>
                    <span className="text-[9px] text-text-muted font-bold">{chat.time}</span>
                  </div>
                  <p className="text-xs text-text-muted truncate">{chat.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* AI Chatbot Area */}
        <div className="lg:col-span-2 h-full min-h-[500px] bg-white rounded-[2rem] overflow-hidden border border-black/5 shadow-sm">
          <AIChatbot variant="inline" />
        </div>
      </div>
    </div>
  );
}
