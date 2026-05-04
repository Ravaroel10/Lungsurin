import React, { createContext, useContext, useState, useEffect } from 'react';

export type Message = {
  id: number;
  text: string;
  sender: 'user' | 'seller' | 'ai';
  time: Date;
};

export type Chat = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  messages: Message[];
  color: string;
};

interface ChatContextType {
  chats: Chat[];
  addMessage: (chatId: string, chatName: string, text: string, sender: 'user' | 'seller' | 'ai', color?: string) => void;
  getChat: (chatId: string) => Chat | undefined;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem('lungsurin_chats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert ISO strings back to Date objects
        return parsed.map((chat: any) => ({
          ...chat,
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            time: new Date(msg.time)
          }))
        }));
      } catch (e) {
        console.error("Failed to parse chats", e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('lungsurin_chats', JSON.stringify(chats));
  }, [chats]);

  const addMessage = (chatId: string, chatName: string, text: string, sender: 'user' | 'seller' | 'ai', color: string = 'bg-primary-100') => {
    setChats(prev => {
      const existingChatIndex = prev.findIndex(c => c.id === chatId);
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newMessage: Message = {
        id: Date.now(),
        text,
        sender,
        time: now,
      };

      if (existingChatIndex > -1) {
        const updatedChats = [...prev];
        const chat = updatedChats[existingChatIndex];
        updatedChats[existingChatIndex] = {
          ...chat,
          lastMessage: text,
          time: timeStr,
          messages: [...chat.messages, newMessage]
        };
        // Move to top
        const moved = updatedChats.splice(existingChatIndex, 1)[0];
        return [moved, ...updatedChats];
      } else {
        return [{
          id: chatId,
          name: chatName,
          lastMessage: text,
          time: timeStr,
          color,
          messages: [newMessage]
        }, ...prev];
      }
    });
  };

  const getChat = (chatId: string) => chats.find(c => c.id === chatId);

  return (
    <ChatContext.Provider value={{ chats, addMessage, getChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
