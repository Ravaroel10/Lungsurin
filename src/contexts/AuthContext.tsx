import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (userData: Partial<User> & { password?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync Firebase User with Firestore
  const syncUser = async (firebaseUser: any, additionalData: any = {}) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        fullName: firebaseUser.displayName || additionalData.fullName || 'New User',
        username: (firebaseUser.email?.split('@')[0] || 'user') + Math.floor(Math.random() * 1000),
        role: additionalData.role || 'USER',
        favorites: [],
        points: 50,
        streak: 1,
        lastActionDate: new Date().toISOString().split('T')[0],
        address: additionalData.address || '',
        phoneNumber: firebaseUser.phoneNumber || additionalData.phoneNumber || '',
        gender: additionalData.gender || 'Other',
        dateOfBirth: additionalData.dateOfBirth || '',
        createdAt: new Date().toISOString(),
      };
      await setDoc(userRef, { ...newUser, createdAt: serverTimestamp() });
      setUser(newUser);
    } else {
      setUser(userDoc.data() as User);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        await syncUser(firebaseUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUser(result.user);
    } catch (error: any) {
      console.error("Google login error", error);
      let errorMessage = "Terjadi kesalahan saat masuk dengan Google.";
      if (error.code === 'auth/network-request-failed' || error.message?.includes('network error')) {
        errorMessage = "Koneksi jaringan gagal. Jika Anda menggunakan mode Incognito atau browser memblokir cookie pihak ketiga di dalam iFrame, silakan buka aplikasi ini di tab baru (Open in New Tab) atau izinkan cookie.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Jendela login ditutup sebelum selesai.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Jendela popup diblokir oleh browser. Harap izinkan popup untuk situs ini.";
      }
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      if (password) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await syncUser(result.user);
      } else {
        // Fallback or demo case
        throw new Error("Password required for manual login with Firebase.");
      }
    } catch (error: any) {
      console.error("Login error", error);
      let message = "Login failed. Please check your credentials.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = "Invalid email or password.";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Too many failed attempts. Please try again later.";
      }
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password?: string }) => {
    setIsLoading(true);
    try {
      if (userData.email && userData.password) {
        const result = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        await syncUser(result.user, userData);
      } else {
        throw new Error("Email and password required for registration.");
      }
    } catch (error: any) {
      console.error("Registration error", error);
      let message = "Registration failed. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        message = "This email is already registered. Please sign in instead.";
      } else if (error.code === 'auth/invalid-email') {
        message = "Please enter a valid email address.";
      } else if (error.code === 'auth/weak-password') {
        message = "Password is too weak. Please use at least 6 characters.";
      }
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUser = async (data: Partial<User>) => {
    if (user && auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() });
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, register, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
