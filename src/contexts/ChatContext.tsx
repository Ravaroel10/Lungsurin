import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, orderBy, serverTimestamp, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'seller' | 'ai';
  senderId: string;
  time: any;
};

export type Chat = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  messages: Message[];
  color: string;
  participants: string[];
};

interface ChatContextType {
  chats: Chat[];
  addMessage: (chatId: string, chatName: string, text: string, sender: 'user' | 'seller' | 'ai', color?: string) => Promise<void>;
  getChat: (chatId: string) => Chat | undefined;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    if (!user) {
      setChats([]);
      return;
    }

    const q = query(collection(db, 'conversations'), where('participants', 'array-contains', user.id));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList: Chat[] = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          name: data.otherPartyName || 'Conversation',
          lastMessage: data.lastMessage || '',
          time: data.updatedAt?.toDate().toLocaleTimeString() || '',
          messages: [],
          color: 'bg-primary-100',
          participants: data.participants
        };
      });
      setChats(chatList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'conversations');
    });

    return () => unsubscribe();
  }, [user]);

  const addMessage = async (chatId: string, chatName: string, text: string, sender: 'user' | 'seller' | 'ai', color: string = 'bg-primary-100') => {
    if (!user) return;

    // Check if conversation exists
    const convRef = doc(db, 'conversations', chatId);
    const convSnap = await getDoc(convRef);

    if (!convSnap.exists()) {
      // Logic for new conversation should ideally happen before calling addMessage or here
    }

    // Add message to subcollection
    await addDoc(collection(db, 'conversations', chatId, 'messages'), {
      text,
      senderId: user.id,
      senderType: sender,
      createdAt: serverTimestamp()
    });

    // Update conversation summary
    // ...
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
