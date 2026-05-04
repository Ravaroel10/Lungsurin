import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Heart, 
  User, 
  Store, 
  ShieldCheck, 
  ShoppingBag, 
  MessageSquare, 
  BookOpen, 
  Leaf, 
  ChevronRight, 
  Menu, 
  X, 
  Sparkles,
  Crown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { Logo } from './Logo';
import { motion, AnimatePresence } from 'motion/react';

import { useCart } from '../contexts/CartContext';

export function Navbar() {
  const { user, updateUser } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Beranda', path: '/' },
    { label: 'Pesanan', path: '/orders' },
    { label: 'Scan Busana', path: '/analyze' },
    { label: 'Marketplace', path: '/marketplace' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const NavLink = ({ item, mobile = false }: { item: typeof navItems[0], mobile?: boolean }) => (
    <Link
      to={item.path}
      onClick={() => setIsOpen(false)}
      className={cn(
        "transition-all duration-300",
        mobile 
          ? "text-3xl font-black py-4 border-b-2 border-primary-950 block" 
          : "text-[12px] font-black uppercase tracking-widest px-5 py-2.5 rounded-lg",
        location.pathname === item.path 
          ? mobile ? "text-primary-500" : "bg-primary-950 text-white"
          : mobile ? "text-primary-900/60 hover:text-primary-950" : "text-primary-950/70 hover:text-primary-500 hover:bg-primary-50"
      )}
    >
      <span className="flex items-center gap-2">
        {item.label}
      </span>
    </Link>
  );

  return (
    <>
      <nav className={cn(
        "fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-w-[1400px] z-50 transition-all duration-500 px-4 sm:px-6 py-2.5 sm:py-3.5",
        scrolled 
          ? "bg-white/95 border-2 border-primary-950 shadow-2xl rounded-xl" 
          : "bg-white/80 border border-primary-950/20 shadow-lg rounded-2xl"
      )}>
        <div className="relative h-10 sm:h-12">
          <AnimatePresence mode="wait">
            {!isSearchOpen ? (
              <motion.div 
                key="nav-main"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-3 items-center w-full h-full"
              >
                {/* Left: Navigation Categories */}
                <div className="flex items-center justify-start gap-1">
                  <div className="hidden xl:flex items-center gap-1">
                    {navItems.map((item) => (
                      <NavLink key={item.path} item={item} />
                    ))}
                  </div>

                  {/* Mobile: Menu Toggle */}
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="xl:hidden p-2.5 bg-primary-950 text-white rounded-lg shadow-lg hover:bg-primary-500 transition-all shrink-0"
                  >
                    <Menu size={18} />
                  </motion.button>
                </div>

                {/* Center: Logo */}
                <div className="flex items-center justify-center min-w-fit">
                  <Link to="/" className="flex items-center">
                    <Logo size={scrolled ? 24 : 28} />
                  </Link>
                </div>

                {/* Right: Icons & Profile */}
                <div className="flex items-center justify-end gap-1 sm:gap-3">
                  <div className="hidden md:flex items-center gap-1 bg-white p-1 rounded-lg border border-primary-950/5 shadow-inner">
                    <Link 
                      to="/education" 
                      className="flex items-center gap-2 px-2 lg:px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary-950/60 hover:text-primary-950 hover:bg-primary-50 rounded-md transition-all"
                    >
                      <BookOpen size={14} />
                      <span className="hidden xl:inline">Edukasi</span>
                    </Link>
                    
                    <Link 
                      to="/premium" 
                      className="flex items-center gap-2 px-2 lg:px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-accent-gold hover:bg-accent-gold/5 rounded-md transition-all border border-accent-gold/10"
                    >
                      <Crown size={14} />
                      <span className="hidden xl:inline text-primary-950/80">Premium</span>
                    </Link>

                    <div className="hidden lg:block w-px h-4 bg-primary-950/10 mx-1" />

                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsSearchOpen(true)}
                      className="p-2 text-primary-950/60 hover:text-primary-950 rounded-md hover:bg-primary-50 transition-all"
                    >
                      <Search size={16} strokeWidth={2.5} />
                    </motion.button>
                    
                    <motion.div whileTap={{ scale: 0.95 }} className="hidden lg:block">
                      <Link 
                        to={user ? "/dashboard" : "/login"} 
                        className="p-2 text-primary-950/60 hover:text-primary-950 rounded-md hover:bg-white transition-all block shadow-sm"
                      >
                        <ShieldCheck size={16} strokeWidth={2.5} />
                      </Link>
                    </motion.div>

                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Link 
                        to="/chat" 
                        className="p-2 text-primary-500 hover:text-primary-950 rounded-md hover:bg-white transition-all block shadow-sm"
                        title="Talk to Lungsurin AI"
                      >
                        <MessageSquare size={16} strokeWidth={2.5} />
                      </Link>
                    </motion.div>
                  </div>
                  
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Link 
                      to={user ? "/profile" : "/login"} 
                      className="p-2 bg-primary-950 text-white rounded-lg block shadow-xl hover:bg-primary-500 transition-all relative"
                    >
                      <User size={16} strokeWidth={2.5} />
                      {user?.isPremium && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-accent-gold rounded-full border-2 border-primary-950 flex items-center justify-center"
                        >
                          <Crown size={8} className="text-primary-950" fill="currentColor" />
                        </motion.div>
                      )}
                    </Link>
                  </motion.div>
                  
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Link to="/cart" className="p-2 bg-primary-300 text-primary-950 rounded-lg relative block shadow-lg hover:scale-105 transition-all border border-primary-950/10">
                      <ShoppingBag size={16} strokeWidth={2.5} />
                      {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center bg-primary-950 text-[8px] font-black text-white rounded-md border-2 border-primary-300 px-1">
                          {totalItems}
                        </span>
                      )}
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="search-bar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full flex items-center gap-3 px-2"
              >
                <div className="p-2 text-primary-950/40">
                  <Search size={18} />
                </div>
                <form onSubmit={handleSearch} className="flex-1">
                  <input 
                    ref={searchInputRef}
                    type="text"
                    placeholder="Apa yang ingin Anda cari di arsip sirkular kami?"
                    className="w-full bg-transparent outline-none text-primary-950 font-display font-medium text-sm sm:text-base placeholder:text-primary-950/30"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:block text-[10px] font-black uppercase text-primary-950/30 tracking-widest border border-primary-950/10 px-2 py-1 rounded">Enter to Search</span>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2 hover:bg-primary-50 rounded-full transition-colors text-primary-950/60"
                  >
                    <X size={18} />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Mobile Drawer - Moved outside transformed container */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100]">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-primary-950/20 backdrop-blur-sm"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 left-0 w-full max-w-[320px] bg-[#F9F8F6] p-8 shadow-[0_0_50px_rgba(0,0,0,0.1)] border-r border-primary-900/10 opacity-100"
            >
              <div className="flex justify-between items-center mb-12">
                <Logo size={28} />
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-3 border border-primary-900/10 bg-white text-primary-950 rounded-full hover:bg-primary-50 transition-colors shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-900/40 mb-6">Navigation</p>
                {navItems.map((item) => (
                  <NavLink key={item.path} item={item} mobile />
                ))}
                
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-900/40 mt-12 mb-6">Akun</p>
                <Link to={user ? "/profile" : "/login"} onClick={() => setIsOpen(false)} className="text-2xl font-black py-4 border-b border-primary-900/10 block text-primary-950 hover:text-primary-500 transition-colors">
                  {user ? 'Profil Saya' : 'Masuk'}
                </Link>
                <Link to="/chat" onClick={() => setIsOpen(false)} className="text-2xl font-black py-4 border-b border-primary-900/10 block text-primary-900/50 hover:text-primary-950 transition-colors">
                  Dukungan
                </Link>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function SparklesIcon({ size, className }: { size: number, className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>;
}
