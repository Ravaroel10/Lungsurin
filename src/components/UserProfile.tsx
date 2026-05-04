import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, MapPin, Phone, Calendar, LogOut, Edit3, Save, Camera, Shield, MessageSquare, ShoppingBag, Heart, Crown, X, Check } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_ORDERS } from '../lib/mockData';
import Cropper, { Area } from 'react-easy-crop';

// Helper to create cropped image
const getCroppedImg = (imageSrc: string, pixelCrop: Area): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('No 2d context'));
        return;
      }

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      // Quality compression to keep it under Firestore limits
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    image.onerror = (error) => reject(error);
  });
};

export function UserProfile() {
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  
  // Cropping states
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  if (!user) return null;

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    if (imageToCrop && croppedAreaPixels) {
      try {
        setIsCropping(true);
        const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
        await updateUser({ avatar: croppedImage });
        setImageToCrop(null);
        (window as any).addNotification('Foto profil berhasil diperbarui.', 'success');
      } catch (e) {
        console.error(e);
        (window as any).addNotification('Gagal memproses foto.', 'error');
      } finally {
        setIsCropping(false);
      }
    }
  };

  const handleUpdate = () => {
    if (editedUser && user) {
      // Only send changed fields to prevent rule violations
      const changes: Partial<typeof user> = {};
      if (editedUser.fullName !== user.fullName) changes.fullName = editedUser.fullName;
      if (editedUser.username !== user.username) changes.username = editedUser.username;
      if (editedUser.phoneNumber !== user.phoneNumber) changes.phoneNumber = editedUser.phoneNumber;
      if (editedUser.address !== user.address) changes.address = editedUser.address;
      
      if (Object.keys(changes).length > 0) {
        updateUser(changes);
      }
      setIsEditing(false);
    }
  };

  return (
    <div className="w-full h-full pb-32">
      <div className="max-w-[1800px] mx-auto">
        <div className="p-12 lg:p-24 modular-border border-t-0 border-x-0 space-y-12 bg-white">
          <div className="space-y-4 max-w-4xl">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-clay">Panel Pengguna</p>
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[7vw] font-display font-black leading-[0.9] tracking-tight break-words">Manajemen <br className="hidden sm:block" /> Identitas</h1>
            <p className="text-text-muted font-medium max-w-xl text-base md:text-lg leading-relaxed">
              Kelola profil Anda dalam ekosistem sirkular Lungsurin.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 modular-border border-t-0 border-x-0">
          {/* Sidebar Profile Card */}
          <div className="lg:p-12 p-8 modular-border border-y-0 border-l-0 space-y-12 bg-[#F7F7F0]">
            <div className="space-y-8 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-48 h-48 modular-border overflow-hidden bg-white grayscale hover:grayscale-0 transition-all duration-500">
                  <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=2D4739&color=fff`} alt={user.fullName} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" referrerPolicy="no-referrer" />
                </div>
                <motion.label 
                  whileTap={{ scale: 0.95 }}
                  className="absolute -bottom-4 -right-4 p-5 bg-white modular-border text-primary-900 shadow-2xl hover:bg-black hover:text-white transition-all shadow-primary-900/10 cursor-pointer"
                >
                  <Camera size={20} strokeWidth={1.5} />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          (window as any).addNotification('File terlalu besar. Maksimal 5MB.', 'error');
                          return;
                        }

                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImageToCrop(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </motion.label>
              </div>
              <div className="space-y-2 max-w-full overflow-hidden">
                <h2 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight break-words">{user.fullName}</h2>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] truncate">Reference: @{user.username}</p>
              </div>
              
              <div className="px-6 py-2 modular-border text-[10px] font-black uppercase tracking-[0.3em] bg-white flex items-center justify-center gap-2">
                {user.isPremium && <Crown size={14} className="text-accent-gold" />}
                Tier: {user.isPremium ? 'Lungsurin Premium' : `${user.role} Verified`}
              </div>
              
              {!user.isPremium && (
                <Link 
                  to="/premium"
                  className="w-full py-4 bg-primary-100 text-primary-950 font-display font-black uppercase tracking-widest text-[10px] hover:bg-accent-gold transition-all flex items-center justify-center gap-2"
                >
                  Daftar Premium <Crown size={12} />
                </Link>
              )}
            </div>

            <div className="space-y-px modular-border bg-[#E5E5DE]">
               {user.isPremium && (
                 <Link 
                  to="/premium"
                  className="w-full p-8 bg-white flex items-center justify-between group hover:bg-primary-950 hover:text-white transition-all text-left"
                 >
                   <div className="flex items-center gap-6">
                     <Crown size={20} strokeWidth={1.5} className="text-accent-gold" />
                     <span className="text-[11px] font-black uppercase tracking-[0.3em]">Premium Dashboard</span>
                   </div>
                   <ChevronRight size={24} strokeWidth={1} />
                 </Link>
               )}
               <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={() => (window as any).addNotification('Retrieving historical archival logs...', 'info')}
                className="w-full p-8 bg-white flex items-center justify-between group hover:bg-black hover:text-white transition-all text-left"
               >
                 <div className="flex items-center gap-6">
                   <ShoppingBag size={20} strokeWidth={1.5} />
                   <span className="text-[11px] font-black uppercase tracking-[0.3em]">Archive Logs</span>
                 </div>
                 <div className="text-3xl font-display font-black opacity-20 group-hover:opacity-100 transition-opacity">08</div>
               </motion.button>
               <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={() => (window as any).addNotification('Syncing curated metadata...', 'info')}
                className="w-full p-8 bg-white flex items-center justify-between group hover:bg-black hover:text-white transition-all text-left"
               >
                 <div className="flex items-center gap-6">
                   <Heart size={20} strokeWidth={1.5} />
                   <span className="text-[11px] font-black uppercase tracking-[0.3em]">Curation</span>
                 </div>
                 <div className="text-3xl font-display font-black opacity-20 group-hover:opacity-100 transition-opacity">{user.favorites.length < 10 ? `0${user.favorites.length}` : user.favorites.length}</div>
               </motion.button>
               
               <div className="flex flex-col sm:flex-row items-center gap-px bg-[#E5E5DE]">
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={logout}
                  className="flex-1 p-8 bg-white flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-accent-clay hover:bg-accent-clay hover:text-white transition-all"
                >
                  <LogOut size={16} />
                  Putuskan Sambungan
                </motion.button>
                
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    if (window.confirm('APAKAH ANDA YAKIN? Semua archived data, poin, dan status premium akan dihapus permanen.')) {
                      try {
                        await updateUser({
                          points: 0,
                          streak: 0,
                          isPremium: false,
                          favorites: [],
                          purchasedCount: 0,
                          phoneNumber: '',
                          address: '',
                        });
                        (window as any).addNotification('IDENTITAS BERHASIL DIRESET KE TITIK NOL.', 'info');
                      } catch (err) {
                        (window as any).addNotification('Gagal mereset data.', 'error');
                      }
                    }
                  }}
                  className="p-8 bg-white flex items-center justify-center text-accent-maroon hover:bg-accent-maroon hover:text-white transition-all"
                  title="Reset Akun"
                >
                  <X size={20} />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-2 p-8 lg:p-24 space-y-16 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 sm:modular-border sm:border-t-0 sm:border-x-0 sm:pb-8">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Data Personal</p>
                <h3 className="text-4xl lg:text-5xl font-display font-black uppercase leading-none">Informasi Profil</h3>
              </div>
              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
                className="btn-fashion px-12"
              >
                {isEditing ? 'Simpan Perubahan' : 'Mulai Edit'}
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-12">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Nama Resmi</label>
                  {isEditing ? (
                    <input 
                      className="w-full p-5 modular-border bg-[#F7F7F0] focus:ring-1 focus:ring-black outline-none font-display text-2xl"
                      value={editedUser?.fullName}
                      onChange={(e) => setEditedUser(u => u ? {...u, fullName: e.target.value} : null)}
                    />
                  ) : (
                    <div className="text-3xl font-display font-black uppercase tracking-tight">{user.fullName}</div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Tautan Komunikasi</label>
                  <div className="text-sm font-medium tracking-widest text-text-muted underline decoration-[#E5E5DE] underline-offset-8">{user.email}</div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Kontak Telepon</label>
                  {isEditing ? (
                    <input 
                      className="w-full p-5 modular-border bg-[#F7F7F0] focus:ring-1 focus:ring-black outline-none font-medium"
                      value={editedUser?.phoneNumber}
                      onChange={(e) => setEditedUser(u => u ? {...u, phoneNumber: e.target.value} : null)}
                    />
                  ) : (
                    <div className="text-xl font-display font-black tracking-widest">{user.phoneNumber}</div>
                  )}
                </div>
              </div>

              <div className="space-y-12">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Tanggal Lahir</label>
                  <div className="text-xl font-display font-black tracking-widest uppercase">{formatDate(user.dateOfBirth)}</div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Koordinat Geografis Utama</label>
                  {isEditing ? (
                    <textarea 
                      className="w-full p-5 modular-border bg-[#F7F7F0] focus:ring-1 focus:ring-black outline-none font-medium resize-none h-32"
                      value={editedUser?.address}
                      onChange={(e) => setEditedUser(u => u ? {...u, address: e.target.value} : null)}
                    />
                  ) : (
                    <div className="text-sm font-medium text-text-dark leading-loose uppercase tracking-widest">{user.address}</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="pt-24 modular-border border-x-0 border-b-0 space-y-12">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Arsip Transaksi</p>
                <h4 className="text-4xl font-display font-black uppercase">Riwayat Keuangan</h4>
              </div>
              <div className="item-grid modular-border bg-[#E5E5DE] space-y-px">
                {MOCK_ORDERS.filter(o => o.userId === user.id).map(order => (
                  <div key={order.id} className="bg-white p-6 md:p-12 flex flex-col md:flex-row md:items-center justify-between group hover:bg-[#F7F7F0] transition-colors gap-6 md:gap-8">
                    <div className="flex items-center gap-4 md:gap-8">
                      <div className="w-12 h-12 md:w-16 md:h-16 modular-border flex items-center justify-center grayscale group-hover:grayscale-0 transition-all shrink-0">
                        <ShoppingBag size={24} strokeWidth={1.5} className="w-6 h-6 md:w-8 md:h-8" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="text-lg md:text-xl font-display font-black uppercase tracking-tight underline decoration-black/10 group-hover:decoration-black truncate">Ref: #{order.id.toUpperCase()}</p>
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em]">{formatDate(order.createdAt?.toDate ? order.createdAt.toDate() : order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-8 md:gap-16">
                      <div className="text-right space-y-1">
                        <p className="text-2xl md:text-3xl font-display font-black">{formatCurrency(order.total)}</p>
                        <p className="text-[10px] font-black text-accent-sage uppercase tracking-[0.3em]">Tervalidasi</p>
                      </div>
                      <ChevronRight size={24} strokeWidth={1} className="text-primary-900 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cropper Modal */}
      <AnimatePresence>
        {imageToCrop && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setImageToCrop(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xl aspect-square bg-white modular-border overflow-hidden flex flex-col"
            >
              <div className="flex-1 relative">
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  cropShape="round"
                  showGrid={false}
                />
              </div>
              <div className="p-8 bg-white space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Zoom Penyesuaian</label>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-1 bg-[#E5E5DE] rounded-lg appearance-none cursor-pointer accent-black"
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setImageToCrop(null)}
                    disabled={isCropping}
                    className="flex-1 py-4 modular-border border-accent-clay/20 text-accent-clay font-display font-black uppercase tracking-widest text-[10px] hover:bg-accent-clay/10"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleCropSave}
                    disabled={isCropping}
                    className="flex-1 py-4 bg-primary-950 text-white font-display font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all flex items-center justify-center gap-2"
                  >
                    {isCropping ? <div className="loading-dots">Memproses</div> : <><Check size={14} /> Atur Foto</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChevronRight({ size, className, strokeWidth = 2.5 }: { size: number, className?: string, strokeWidth?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={strokeWidth} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
