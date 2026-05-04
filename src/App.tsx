import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { Marketplace } from './components/Marketplace';
import { LoginPage, SignupPage } from './components/Auth';
import { UserDashboard, SellerDashboard, AdminDashboard } from './components/Dashboards';
import { UserProfile } from './components/UserProfile';
import { AIChatbot } from './components/AIChatbot';
import { EducationHub } from './components/Education';
import { AnalysisLab } from './components/AnalysisLab';
import { ProductDetail } from './components/ProductDetail';
import { Favorites } from './components/Favorites';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { Orders } from './components/Orders';
import { Logo } from './components/Logo';
import { ChatPage } from './components/ChatPage';
import { PremiumHub } from './components/PremiumHub';
import { Notification } from './components/Notification';
import { useLocation } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { ChatProvider } from './contexts/ChatContext';
import { IntroModal } from './components/IntroModal';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, ExternalLink, LogOut } from 'lucide-react';

function PendingApproval() {
  const { logout } = useAuth();
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white modular-border p-10 text-center space-y-8 shadow-[12px_12px_0px_rgba(0,0,0,1)]"
      >
        <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto">
          <Clock size={40} className="text-primary-500 animate-pulse" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-display font-black uppercase tracking-tighter text-primary-950">Akun Menunggu <span className="text-primary-500">Konfirmasi</span></h2>
          <p className="text-primary-900/60 font-medium leading-relaxed">
            Permintaan akses administrator Anda telah diterima. Untuk mempercepat proses verifikasi, silakan hubungi tim kami melalui WhatsApp.
          </p>
        </div>
        <div className="space-y-4">
          <a 
            href="https://wa.me/628119410609" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-4 bg-[#25D366] text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
          >
            Konfirmasi Via WhatsApp <ExternalLink size={14} />
          </a>
          <button 
            onClick={() => logout()}
            className="w-full py-4 border-2 border-primary-950 text-primary-950 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-primary-50 transition-colors"
          >
            Keluar Akun <LogOut size={14} />
          </button>
        </div>
        <p className="text-[10px] font-bold text-primary-900/30 uppercase tracking-[0.2em]">Status: Menunggu Persetujuan Tim Owner</p>
      </motion.div>
    </div>
  );
}

function PrivateRoute({ children, role }: { children: React.ReactNode, role?: string }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/dashboard" />;
  
  return <>{children}</>;
}

function UnifiedDashboard() {
  const { user } = useAuth();
  const [showIntro, setShowIntro] = React.useState(false);

  React.useEffect(() => {
    // Check if intro has been shown this session
    const hasShownIntro = sessionStorage.getItem('hasShownIntro');
    if (!hasShownIntro && user) {
      setShowIntro(true);
      sessionStorage.setItem('hasShownIntro', 'true');
    }
  }, [user]);
  
  if (!user) return <Navigate to="/login" />;
  
  if (user.role === 'ADMIN' && user.status === 'pending') {
    return <PendingApproval />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'SELLER':
        return <SellerDashboard />;
      default:
        return <UserDashboard />;
    }
  };

  return (
    <>
      {renderDashboard()}
      <IntroModal isOpen={showIntro} onClose={() => setShowIntro(false)} />
    </>
  );
}

function AppContent() {
  const { user, isLoading, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isChatRoute = location.pathname === '/chat';

  if (user && user.role === 'ADMIN' && user.status === 'pending' && location.pathname !== '/dashboard') {
    return <Navigate to="/dashboard" />;
  }

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  React.useEffect(() => {
    if (isLoading) return;

    // If user is at root and not logged in, they see the Landing Page (Home)
    // If they are logged in, we let them stay or move as they wish.
  }, [location.pathname, isLoading, user]);

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col">
      <Navbar />
      <Notification />
      
      <main className="flex-1 w-full pt-20 lg:pt-24 min-h-screen">
        <div className="w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={
              <PrivateRoute>
                <Marketplace />
              </PrivateRoute>
            } />
            <Route path="/analyze" element={
              <PrivateRoute>
                <AnalysisLab />
              </PrivateRoute>
            } />
            <Route path="/product/:id" element={
              <PrivateRoute>
                <ProductDetail />
              </PrivateRoute>
            } />
            <Route path="/saved" element={
              <PrivateRoute>
                <Favorites />
              </PrivateRoute>
            } />
            <Route path="/cart" element={
              <PrivateRoute>
                <Cart />
              </PrivateRoute>
            } />
            <Route path="/checkout" element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            } />
            <Route path="/orders" element={
              <PrivateRoute>
                <Orders />
              </PrivateRoute>
            } />
            <Route path="/education" element={
              <PrivateRoute>
                <EducationHub />
              </PrivateRoute>
            } />
            <Route path="/premium" element={
              <PrivateRoute>
                <PremiumHub />
              </PrivateRoute>
            } />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
            <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignupPage />} />
            
            <Route path="/dashboard" element={
              <PrivateRoute>
                <UnifiedDashboard />
              </PrivateRoute>
            } />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            } />

            <Route path="/chat" element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </main>
      
      <footer className="footer-dark py-16 sm:py-24 px-6 sm:px-10 bg-primary-950 text-white bg-batik-dark">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 sm:gap-16">
          <div className="sm:col-span-2 space-y-8">
            <Logo size={40} className="invert brightness-0" />
            <p className="text-white/60 max-w-sm leading-relaxed text-xs sm:text-sm font-medium">
              Merevolusi industri fashion melalui ekosistem terintegrasi sirkular. Analisis, perbaiki, dan tukar untuk masa depan tanpa limbah.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-white text-lg tracking-widest">Perusahaan</h4>
            <ul className="space-y-3 text-white/50 text-xs font-bold uppercase tracking-widest">
              <li><a href="#" className="hover:text-white transition-colors">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Laporan Dampak</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Keberlanjutan</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Karier</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-white text-lg tracking-widest">Bantuan</h4>
            <ul className="space-y-3 text-white/50 text-xs font-bold uppercase tracking-widest">
              <li><a href="https://wa.me/628119410609" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Pusat Bantuan</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pelacakan Pengiriman</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kebijakan Retur</a></li>
              <li><a href="https://wa.me/628119410609" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Kontak Kami</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-white text-lg tracking-widest">Kontak</h4>
            <div className="space-y-3 text-white/50 text-xs font-bold uppercase tracking-widest leading-loose">
              <p>Email: Lungsurin.id@gmail.com</p>
              <p>Telepon: +62 811-941-0609</p>
              <p>Alamat: SMA Unggulan Rushd, Kebayanan 1, Jati, Masaran, Kabupaten Sragen, Jawa Tengah 57282</p>
            </div>
          </div>
        </div>
        
        <div className="max-w-[1800px] mx-auto mt-24 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
          <p>© 2026 Lungsurin. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-all">Instagram</a>
            <a href="#" className="hover:text-white transition-all">Twitter</a>
            <a href="#" className="hover:text-white transition-all">TikTok</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ChatProvider>
            <AppContent />
          </ChatProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
