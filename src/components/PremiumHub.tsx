import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, 
  Sparkles, 
  Zap, 
  Clock, 
  Award, 
  Ticket, 
  ChevronRight, 
  Star,
  Camera,
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  Layout,
  Palette,
  Loader2,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GoogleGenAI } from "@google/genai";
import { PREMIUM_PRICE, PREMIUM_PRICE_FORMATTED } from '../constants';

interface StylingResult {
  outfitCombination: string;
  accessories: string[];
  recommendedEvent: string;
  colorPalette: string;
  modernTwist: string;
}

const PREMIUM_PLANS = [
  {
    id: 'gold',
    name: 'Lungsurin Gold Member',
    price: PREMIUM_PRICE_FORMATTED,
    duration: 'Per Bulan',
    features: [
      'Full AI Styling Suite Unlimited',
      '2x Point Multiplier Selamanya',
      '48h Early Access Marketplace',
      'Verified Badge Eksklusif',
      'E-Certificate Digital Ambassador',
      'Prioritas Layanan CS 24/7'
    ],
    color: 'bg-primary-950 text-white border-accent-gold/30',
    btnColor: 'bg-accent-gold text-primary-950',
    popular: true
  }
];

export function PremiumHub() {
  const { user, updateUser } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalStep, setModalStep] = useState<'confirm' | 'upload' | 'waiting'>('confirm');
  const [selectedPlan, setSelectedPlan] = useState<typeof PREMIUM_PLANS[0] | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'styling' | 'rewards' | 'marketplace'>('styling');
  
  // AI Styling States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stylingResult, setStylingResult] = useState<StylingResult | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeStyling = async (base64Image: string) => {
    setIsAnalyzing(true);
    setStylingResult(null);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      (window as any).addNotification("API Key tidak ditemukan.", "error");
      setIsAnalyzing(false);
      return;
    }

    try {
      const genAI = new GoogleGenAI({ apiKey });
      
      const prompt = `You are an expert Indonesian Traditional Fashion Stylist at Lungsurin Premium. 
      Analyze this image of traditional Indonesian clothing (Batik, Kebaya, Songket, Tenun, etc.) and provide expert styling recommendations.
      Respond ONLY with a JSON object in this format:
      {
        "outfitCombination": "Detailed description of how to wear this with modern items",
        "accessories": ["List of 3 suitable accessories"],
        "recommendedEvent": "Specific event where this style would shine",
        "colorPalette": "Description of matching colors for shoes/bags",
        "modernTwist": "A unique way to make this look contemporary/Gen-Z friendly"
      }
      Use Indonesian language for the values.`;

      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Image.split(',')[1],
                mimeType: "image/jpeg"
              }
            }
          ]
        },
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = result.text;
      const cleanedJson = responseText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanedJson) as StylingResult;
      
      setStylingResult(parsed);
      (window as any).addNotification("Styling berhasil diramu!", "success");
    } catch (error) {
      console.error("AI Styling Error:", error);
      (window as any).addNotification("Gagal menganalisis gaya. Silakan coba lagi.", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      (window as any).addNotification("Ukuran gambar maksimal 4MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreviewImage(base64);
      analyzeStyling(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleUpgrade = async (planId: string) => {
    if (!user) return;
    
    // Switch to upload step
    setModalStep('upload');
  };

  const handleUploadProof = async () => {
    if (!user || !proofImage) {
      (window as any).addNotification('Harap unggah bukti transfer Anda.', 'error');
      return;
    }

    setIsProcessingPayment(true);
    (window as any).addNotification('Mengirimkan bukti transfer...', 'info');
    
    try {
      const batch = writeBatch(db);
      
      // Update user status
      const userRef = doc(db, 'users', user.id);
      batch.update(userRef, { 
        premiumStatus: 'pending',
        premiumProofURL: proofImage 
      });

      // Send chat message to Admin (using sellerId 's1' as demo admin)
      const adminId = 's1'; 
      const chatId = [user.id, adminId].sort().join('_');
      const chatMsgRef = doc(collection(db, 'conversations', chatId, 'messages'));
      const convRef = doc(db, 'conversations', chatId);

      batch.set(convRef, {
        participants: [user.id, adminId],
        updatedAt: serverTimestamp(),
        lastMessage: 'Sistem: Konfirmasi Pembayaran Premium',
      }, { merge: true });

      batch.set(chatMsgRef, {
        text: `Halo Admin! Saya ${user.fullName} telah mentransfer untuk paket ${selectedPlan?.name}. Berikut bukti transfernya. Mohon verifikasi akun premium saya!`,
        senderId: user.id,
        image: proofImage,
        createdAt: serverTimestamp()
      });

      await batch.commit();
      
      await updateUser({ 
        premiumStatus: 'pending',
        premiumProofURL: proofImage 
      });
      
      setModalStep('waiting');
      (window as any).addNotification(`Bukti transfer berhasil dikirim.`, 'success');
    } catch (error) {
      console.error("Upload proof error", error);
      (window as any).addNotification('Gagal mengirim bukti. Silakan coba lagi.', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const compressImage = (base64: string, maxWidth = 800, maxHeight = 800, quality = 0.6): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    });
  };

  const handleProofSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Initial check to prevent extremely large files
    if (file.size > 5 * 1024 * 1024) {
      (window as any).addNotification("File terlalu besar. Maksimal 5MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const compressed = await compressImage(base64);
        setProofImage(compressed);
      } catch (err) {
        console.error("Compression error:", err);
        setProofImage(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  if (user?.premiumStatus === 'pending') {
    return (
      <div className="min-h-screen bg-[#FFFDF8] pt-24 pb-32 flex items-center justify-center bg-ethnic-pattern">
        <div className="max-w-md w-full mx-auto p-12 bg-white border-2 border-primary-950 text-center space-y-8 shadow-[16px_16px_0px_rgba(0,0,0,1)]">
           <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto text-primary-950">
             <Clock size={48} className="animate-pulse" />
           </div>
           <div className="space-y-4">
             <h1 className="text-3xl font-display font-black uppercase">Konfirmasi <br /> Diproses</h1>
             <p className="text-primary-950/60 font-medium leading-relaxed">
               Permintaan upgrade Anda sedang kami tinjau. Jika Anda belum mengirim bukti transfer, silakan hubungi admin melalui WhatsApp.
             </p>
           </div>
           <div className="p-4 bg-primary-50 border-2 border-primary-950">
              <p className="text-[10px] font-black uppercase text-primary-500 mb-1">Status Verifikasi</p>
              <p className="text-sm font-black text-primary-950">MENUNGGU KONFIRMASI MANUAL VIA WA (628119410609)</p>
           </div>
           <div className="space-y-3">
             <a 
              href={`https://wa.me/628119410609?text=${encodeURIComponent("Halo Admin Lungsurin, saya ingin menanyakan status verifikasi Premium saya.")}`}
              target="_blank"
              rel="noreferrer"
              className="block w-full py-4 bg-primary-950 text-white font-display font-black uppercase text-xs hover:bg-primary-800 transition-all"
             >
              Hubungi Admin WA
             </a>
             <Link 
              to="/" 
              className="block py-4 border-2 border-primary-950 font-display font-black uppercase text-xs hover:bg-primary-50 transition-all text-primary-950"
             >
              Kembali ke Beranda
             </Link>
           </div>
        </div>
      </div>
    );
  }

  if (!user?.isPremium) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] pt-24 pb-32 px-4 bg-ethnic-pattern">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Header */}
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-gold/10 text-accent-gold rounded-full border border-accent-gold/20"
            >
              <Crown size={16} />
              <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">Premium Experience</span>
            </motion.div>
            <h1 className="text-5xl md:text-8xl font-display font-black uppercase text-primary-950 leading-[0.8] tracking-tighter">
              Lungsurin <br /> <span className="premium-gradient-text">Premium</span>
            </h1>
            <p className="max-w-2xl mx-auto text-primary-950/60 font-medium text-lg leading-relaxed">
              Buka potensi penuh lemari pakaian Anda. Dapatkan akses ke teknologi AI eksklusif, keuntungan berlipat, dan koleksi wastra terbatas.
            </p>
          </div>

          {/* Pricing Card */}
          <div className="flex justify-center max-w-4xl mx-auto">
            {PREMIUM_PLANS.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ y: -10 }}
                className={cn(
                  "p-8 md:p-12 border-2 flex flex-col justify-between relative overflow-hidden w-full max-w-md",
                  plan.color
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-accent-terracotta text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest rotate-0 origin-top-right">
                    Paling Populer
                  </div>
                )}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-display font-black uppercase">{plan.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-display font-black">{plan.price}</span>
                      <span className="text-xs font-bold opacity-60 uppercase">{plan.duration}</span>
                    </div>
                  </div>
                  <ul className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-bold">
                        <ShieldCheck size={16} className="text-accent-gold" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => {
                    setSelectedPlan(plan);
                    setShowUpgradeModal(true);
                  }}
                  className={cn(
                    "mt-12 w-full py-5 text-sm font-black uppercase tracking-[0.2em] transition-all active:scale-95 relative z-10",
                    plan.btnColor
                  )}
                >
                  Pilih Paket
                </button>
              </motion.div>
            ))}
          </div>

          {/* Benefits Grid */}
          <div className="pt-24 border-t border-primary-950/10">
            <h2 className="text-3xl font-display font-black uppercase text-center mb-16">Eksklusivitas Tiada Tara</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Palette, title: "AI Styling Assistant", desc: "Rekomendasi padu padan busana adat secara modern." },
                { icon: TrendingUp, title: "Reward Multiplier", desc: "Poin 2x lebih cepat untuk setiap aksi sirkular." },
                { icon: Clock, title: "Early Marketplace", desc: "Akses 48 jam lebih awal untuk produk limited edition." },
                { icon: Award, title: "Verified Identity", desc: "Lencana profil eksklusif untuk kredibilitas tinggi." },
                { icon: Ticket, title: "Monthly Vouchers", desc: "Voucher belanja gratis setiap awal bulan." },
                { icon: Sparkles, title: "Priority Support", desc: "Layanan bantuan prioritas dari admin kami." }
              ].map((benefit, i) => (
                <div key={i} className="space-y-4 p-6 bg-white border border-primary-950/5">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-950">
                    <benefit.icon size={24} />
                  </div>
                  <h4 className="font-display font-black uppercase text-lg">{benefit.title}</h4>
                  <p className="text-primary-950/60 font-medium text-sm leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upgrade Modal */}
        <AnimatePresence>
          {showUpgradeModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowUpgradeModal(false)}
                className="absolute inset-0 bg-primary-950/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-white p-12 text-center border-2 border-primary-950 shadow-2xl"
              >
                <div className="flex justify-center mb-8">
                  <div className="w-20 h-20 bg-accent-gold/10 rounded-full flex items-center justify-center text-accent-gold">
                    <Crown size={40} />
                  </div>
                </div>
                <h3 className="text-3xl font-display font-black uppercase text-primary-950 mb-4">Konfirmasi Upgrade</h3>
                <p className="text-primary-950/60 font-medium mb-8">Anda akan melakukan upgrade ke paket <span className="text-primary-950 font-black italic">{selectedPlan?.name}</span>. Siap menembus batas fashion sirkular?</p>
                <div className="space-y-6">
                  {modalStep === 'confirm' && (
                    <>
                      {/* Bank Transfer Details */}
                      <div className="bg-primary-50 p-6 border-2 border-primary-950/10 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary-500">Metode Pembayaran</span>
                          <span className="text-xs font-black text-primary-950">BANK TRANSFER (BCA)</span>
                        </div>
                        
                        <div className="mt-4 p-4 bg-white border-2 border-primary-950 flex flex-col items-center justify-center gap-2">
                           <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">Nomor Rekening</p>
                           <p className="text-2xl font-mono font-black text-primary-950 tracking-tighter">7402 1898 62</p>
                           <p className="text-[10px] font-black text-primary-950 uppercase tracking-widest">A.N. RAFAEL ALVARO DANIEL GULTOM</p>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-primary-900/60 leading-relaxed italic">
                            * Silakan transfer sebesar <span className="text-primary-950 font-black">{PREMIUM_PRICE_FORMATTED}</span> ke rekening di atas. 
                            Pastikan nominal sesuai agar sistem dapat memverifikasi secara otomatis.
                          </p>
                        </div>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        disabled={isProcessingPayment}
                        onClick={() => selectedPlan && handleUpgrade(selectedPlan.id)}
                        className="w-full py-5 bg-primary-950 text-white font-display font-black uppercase tracking-widest hover:bg-primary-500 transition-all cursor-pointer relative z-[110] shadow-[8px_8px_0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                      >
                        {isProcessingPayment ? <Loader2 className="animate-spin mx-auto" size={24} /> : `Saya Sudah Transfer ${PREMIUM_PRICE_FORMATTED}`}
                      </motion.button>
                    </>
                  )}

                  {modalStep === 'upload' && (
                    <div className="space-y-6">
                      <p className="text-sm font-bold text-primary-950 tracking-widest uppercase">Unggah Bukti Transfer</p>
                      
                      <div className="relative group">
                        <input 
                          type="file" 
                          id="proof-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleProofSelect}
                        />
                        <label 
                          htmlFor="proof-upload"
                          className="aspect-video w-full border-2 border-dashed border-primary-950/20 bg-primary-50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-primary-100 transition-all overflow-hidden"
                        >
                          {proofImage ? (
                            <img src={proofImage} className="w-full h-full object-cover" alt="Proof" />
                          ) : (
                            <>
                              <Camera className="text-primary-950/40 mb-2" size={32} />
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary-950/60">Klik untuk pilih gambar</span>
                            </>
                          )}
                        </label>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        disabled={isProcessingPayment || !proofImage}
                        onClick={handleUploadProof}
                        className="w-full py-5 bg-primary-950 text-white font-display font-black uppercase tracking-widest hover:bg-primary-500 transition-all cursor-pointer relative z-[110] shadow-[8px_8px_0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-x-1 active:translate-y-1 disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {isProcessingPayment ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            Mengirim...
                          </>
                        ) : (
                          'Kirim Bukti & Verifikasi'
                        )}
                      </motion.button>
                      
                      <button
                        onClick={() => setModalStep('confirm')}
                        className="text-[10px] font-black uppercase tracking-widest text-primary-950/40 hover:text-primary-950 transition-all"
                      >
                        Kembali ke Detail Bank
                      </button>
                    </div>
                  )}

                  {modalStep === 'waiting' && (
                    <div className="space-y-8 py-4">
                       <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                         <ShieldCheck size={40} />
                       </div>
                       <div className="space-y-2">
                         <h4 className="text-xl font-display font-black uppercase">Pendaftaran Diterima</h4>
                         <p className="text-sm font-medium text-primary-950/60">
                           Bukti Anda telah dikirim ke <span className="font-black text-primary-950">rafa100609@gmail.com</span>. Kami akan memberitahu Anda setelah Rafael Alvaro Daniel Gultom mengaktifkan status premium Anda.
                         </p>
                       </div>
                       <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setShowUpgradeModal(false);
                        }}
                        className="w-full py-5 bg-primary-950 text-white font-display font-black uppercase tracking-widest hover:bg-primary-500 transition-all"
                      >
                        Oke, Mengerti
                      </motion.button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (modalStep !== 'waiting') {
                        setShowUpgradeModal(false);
                        setModalStep('confirm');
                        setProofImage(null);
                      } else {
                        setShowUpgradeModal(false);
                      }
                    }}
                    className={cn(
                      "w-full py-5 border-2 border-primary-950 text-primary-950 font-display font-black uppercase tracking-widest hover:bg-primary-50 transition-all",
                      modalStep === 'waiting' && "hidden"
                    )}
                  >
                    Batalkan
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Premium User Dashboard
  return (
    <div className="min-h-screen bg-[#FFFDF8] pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-12">
        {/* User Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Poin', value: user.points, icon: Star, color: 'text-accent-gold' },
            { label: 'Streak Laju', value: `${user.streak} Hari`, icon: Zap, color: 'text-accent-terracotta' },
            { label: 'Voucher Aktif', value: user.vouchers?.length || 0, icon: Ticket, color: 'text-primary-500' },
            { label: 'Status Hub', value: 'Verified', icon: ShieldCheck, color: 'text-emerald-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-white border-2 border-primary-950 p-6 flex flex-col items-center justify-center text-center space-y-2">
              <stat.icon className={cn("w-6 h-6", stat.color)} />
              <p className="text-[10px] font-black uppercase tracking-widest text-primary-950/40">{stat.label}</p>
              <p className="text-2xl font-display font-black text-primary-950">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 border-b border-primary-950/10 pb-6">
          {[
            { id: 'styling', label: 'AI Styling Assistant', icon: Palette },
            { id: 'rewards', label: 'Reward Dashboard', icon: TrendingUp },
            { id: 'marketplace', label: 'Early Access Hub', icon: ShoppingBag }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-8 py-4 flex items-center gap-3 transition-all font-display font-black uppercase tracking-widest text-sm",
                activeTab === tab.id 
                  ? "bg-primary-950 text-white shadow-xl scale-105" 
                  : "bg-white text-primary-950/40 hover:text-primary-950 border border-primary-950/10"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          <AnimatePresence mode="wait">
            {activeTab === 'styling' && (
              <motion.div
                key="styling"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-4xl md:text-6xl font-display font-black uppercase leading-tight">
                        AI Personal <br /> <span className="premium-gradient-text">Traditional Stylist</span>
                      </h2>
                      <p className="text-primary-950/60 font-medium text-lg leading-relaxed">
                        Teknologi AI kami menganalisis motif wastra Anda dan memberikan saran padu padan untuk acara formal, semi-formal, atau gaya kasual modern.
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isAnalyzing}
                        className="flex-1 py-6 bg-primary-950 text-white font-display font-black uppercase tracking-widest hover:bg-primary-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isAnalyzing ? <Loader2 className="animate-spin" /> : <Camera size={20} />} 
                        {isAnalyzing ? 'Menganalisis...' : 'Mulai Styling'}
                      </button>
                      <button 
                        onClick={() => (window as any).addNotification('Membuka Galeri Styling Premium Anda...', 'info')}
                        className="w-16 h-16 border-2 border-primary-950 flex items-center justify-center hover:bg-primary-50 transition-all transition-transform active:scale-90"
                      >
                        <Layout size={24} />
                      </button>
                    </div>
                  </div>
                  <div className="bg-primary-50 border-2 border-dashed border-primary-950/20 rounded-[3rem] aspect-square flex items-center justify-center relative overflow-hidden group">
                     {!previewImage ? (
                       <div className="text-center space-y-4 pointer-events-none z-10 p-12">
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl">
                            <Camera size={32} className="text-primary-950" />
                          </div>
                          <p className="text-sm font-black uppercase tracking-widest text-primary-950/60">Unggah Foto Pakaian Anda</p>
                       </div>
                     ) : (
                       <div className="relative w-full h-full">
                         <img src={previewImage} className="w-full h-full object-cover" alt="Selected outfit" referrerPolicy="no-referrer" />
                         <button 
                          onClick={() => { setPreviewImage(null); setStylingResult(null); }}
                          className="absolute top-6 right-6 p-3 bg-white text-primary-950 rounded-full shadow-xl hover:bg-accent-terracotta hover:text-white transition-colors"
                         >
                          <X size={20} />
                         </button>
                       </div>
                     )}
                     {!previewImage && <img src="https://images.unsplash.com/photo-1582201942988-13e60e4556ee?q=80&w=1200&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover object-right-top opacity-20 group-hover:opacity-40 transition-opacity duration-1000" referrerPolicy="no-referrer" />}
                  </div>
                </div>

                <AnimatePresence>
                  {stylingResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white border-2 border-primary-950 overflow-hidden"
                    >
                      <div className="bg-primary-950 p-6 flex items-center gap-4">
                        <Sparkles className="text-accent-gold" />
                        <h3 className="font-display font-black uppercase text-white tracking-widest">Rekomendasi Styling Lungsurin</h3>
                      </div>
                      <div className="p-8 md:p-12 grid md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                           <div className="space-y-2">
                             <p className="text-[10px] font-black uppercase tracking-widest text-primary-950/40 leading-none">Modern Combination</p>
                             <p className="text-xl font-medium leading-relaxed">{stylingResult.outfitCombination}</p>
                           </div>
                           <div className="space-y-2">
                             <p className="text-[10px] font-black uppercase tracking-widest text-primary-950/40 leading-none">Modern Twist</p>
                             <div className="p-6 bg-accent-gold/10 border-l-4 border-accent-gold italic">
                                "{stylingResult.modernTwist}"
                             </div>
                           </div>
                        </div>
                        <div className="space-y-8">
                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary-950/40 leading-none">Recommended Event</p>
                                <p className="font-display font-black uppercase">{stylingResult.recommendedEvent}</p>
                              </div>
                              <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary-950/40 leading-none">Color Palette</p>
                                <p className="font-display font-black uppercase">{stylingResult.colorPalette}</p>
                              </div>
                           </div>
                           <div className="space-y-4">
                              <p className="text-[10px] font-black uppercase tracking-widest text-primary-950/40 leading-none">Accessorize with</p>
                              <div className="flex flex-wrap gap-2">
                                {stylingResult.accessories.map((acc, i) => (
                                  <span key={i} className="px-4 py-2 border border-primary-950/10 bg-primary-50 rounded-full text-xs font-black uppercase tracking-widest">
                                    {acc}
                                  </span>
                                ))}
                              </div>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-8">
                   <h3 className="text-xl font-display font-black uppercase border-l-4 border-accent-gold pl-4 tracking-widest">Inspirasi Gaya Premium</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {[
                        { title: 'Modern Kebaya Office', event: 'Corporate Meeting', img: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=600&auto=format&fit=crop' },
                        { title: 'Batik Streetwear', event: 'Casual Weekend', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600&auto=format&fit=crop' },
                        { title: 'Tenun Galan Ceremony', event: 'Traditional Wedding', img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop' }
                      ].map((item, i) => (
                        <div key={i} className="group cursor-pointer">
                          <div className="aspect-[3/4] overflow-hidden bg-primary-100 mb-4 relative rounded-2xl">
                             <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                             <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 flex justify-between items-center translate-y-12 group-hover:translate-y-0 transition-transform">
                                <div>
                                  <p className="text-[10px] font-black uppercase text-primary-950/40">{item.event}</p>
                                  <p className="font-display font-black uppercase text-sm">{item.title}</p>
                                </div>
                                <ChevronRight size={18} />
                             </div>
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'rewards' && (
              <motion.div
                key="rewards"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-3 gap-8"
              >
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-primary-950 text-white p-12 border-2 border-accent-gold relative overflow-hidden bg-ethnic-pattern">
                    <Crown className="absolute -top-12 -right-12 w-64 h-64 text-white/5" />
                    <div className="relative z-10 space-y-8">
                       <div className="space-y-2">
                         <p className="text-xs font-black uppercase tracking-[0.4em] text-accent-gold">Points Progression</p>
                         <h3 className="text-4xl font-display font-black uppercase">Level: Cultural Maestro</h3>
                       </div>
                       
                       <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <span className="text-sm font-bold">{user.points} / 5000 XP</span>
                            <span className="text-xs font-black text-accent-gold uppercase tracking-widest">Next Reward in 850 XP</span>
                          </div>
                          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: '72%' }}
                              className="h-full bg-gradient-to-r from-accent-gold to-accent-terracotta"
                            />
                          </div>
                       </div>

                       <div className="grid grid-cols-3 gap-6 pt-4">
                          <div className="text-center p-4 bg-white/5 border border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Impact Mulitplier</p>
                            <p className="text-xl font-display font-black text-accent-gold">2.0x</p>
                          </div>
                          <div className="text-center p-4 bg-white/5 border border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Rank Global</p>
                            <p className="text-xl font-display font-black text-white">#128</p>
                          </div>
                          <div className="text-center p-4 bg-white/5 border border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Contribution</p>
                            <p className="text-xl font-display font-black text-emerald-400">High</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-display font-black uppercase tracking-widest">Pencapaian Berjalan</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { title: 'Vanguard of Wastra', progress: 80, reward: '1000 Pts' },
                        { title: 'Eco-Weaver Expert', progress: 45, reward: 'Rare Badge' },
                        { title: 'Zero Waste Legend', progress: 95, reward: 'Gold Frame' },
                        { title: 'Cultural Resaver', progress: 20, reward: 'Special Voucher' }
                      ].map((item, i) => (
                        <div key={i} className="bg-white border border-primary-950/10 p-6 flex items-center justify-between group hover:border-primary-950 transition-all">
                           <div className="space-y-2 flex-1 pr-6">
                              <p className="font-bold text-sm">{item.title}</p>
                              <div className="h-1 bg-primary-50 w-full rounded-full overflow-hidden">
                                <div className="h-full bg-primary-950" style={{ width: `${item.progress}%` }} />
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-black uppercase tracking-tighter text-primary-950/40">Reward</p>
                              <p className="text-xs font-black text-accent-terracotta">{item.reward}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <h3 className="font-display font-black uppercase tracking-widest">Koleksi Voucher</h3>
                  <div className="space-y-4">
                    {[
                      { code: 'WAS10', discount: 10, title: 'Wastra Artisan 10%', exp: '30 Apr' },
                      { code: 'LUNGUP', discount: 25, title: 'Upcycle Series 25%', exp: '15 May' },
                      { code: 'GOLDSHIP', discount: 100, title: 'Free Priority Shipping', exp: 'Lifetime' }
                    ].map((v, i) => (
                      <div key={i} className="bg-ethnic-pattern border-2 border-primary-950 p-6 flex justify-between items-center relative overflow-hidden group">
                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#FFFDF8] rounded-full border border-primary-950" />
                        <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#FFFDF8] rounded-full border border-primary-950" />
                        <div className="space-y-1 shrink-0 px-4">
                          <p className="text-[10px] font-black uppercase text-primary-950/40">Exclusive</p>
                          <p className="font-display font-black uppercase text-lg leading-tight">{v.title}</p>
                          <p className="text-xs font-bold text-accent-maroon">Exp: {v.exp}</p>
                        </div>
                        <div className="text-center py-2 px-4 bg-primary-950 text-white group-hover:bg-primary-500 transition-colors cursor-pointer">
                           <span className="text-xs font-black uppercase tracking-widest">{v.code}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'marketplace' && (
              <motion.div
                key="marketplace"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                   <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <span className="inline-block px-3 py-1 bg-accent-terracotta text-white text-[10px] font-black uppercase tracking-widest animate-pulse">Live Now</span>
                         <h2 className="text-4xl md:text-6xl font-display font-black uppercase">Early Access Hub</h2>
                      </div>
                      <p className="text-primary-950/60 font-medium max-w-xl">Member Premium mendapatkan akses 48 jam lebih awal untuk produk-produk kolaborasi pengrajin lokal dan koleksi wastra langka sebelum dirilis ke publik.</p>
                   </div>
                   <div className="flex items-center gap-4 bg-primary-100 px-6 py-4 rounded-xl">
                      <Clock size={20} className="text-primary-950" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-primary-950/40 tracking-widest leading-none">Global Release in</p>
                        <p className="text-lg font-display font-black text-primary-950">23:45:12</p>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { id: 'ea1', name: 'Kawung Silk Scarf', price: 'Rp 350.000', origin: 'Jogja Artisan', img: 'https://images.unsplash.com/photo-1590736704728-f4730bb3c3af?q=80&w=800&auto=format&fit=crop', stock: 3 },
                    { id: 'ea2', name: 'Upcycled Denim Batik', price: 'Rp 480.000', origin: 'Lungsurin Lab', img: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=800&auto=format&fit=crop', stock: 1 },
                    { id: 'ea3', name: 'Tenun Bone Belt', price: 'Rp 120.000', origin: 'Bone, Sulsel', img: 'https://images.unsplash.com/photo-1614715838608-dd527c46231d?q=80&w=800&auto=format&fit=crop', stock: 10 },
                    { id: 'ea4', name: 'Kebaya Encim Modern', price: 'Rp 450.000', origin: 'Betawi Craft', img: 'https://images.unsplash.com/photo-1621330396173-e41b1cafd17f?q=80&w=800&auto=format&fit=crop', stock: 5 },
                  ].map((item) => (
                    <motion.div 
                      key={item.id}
                      whileHover={{ y: -10 }}
                      className="group cursor-pointer"
                    >
                      <div className="aspect-[3/4] bg-primary-50 rounded-[2rem] overflow-hidden relative mb-4">
                        <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                        <div className="absolute top-4 left-4 flex gap-2">
                           <span className="px-3 py-1 bg-primary-950 text-white text-[9px] font-black uppercase tracking-widest rounded-full">Premium Exclusive</span>
                           {item.stock < 5 && <span className="px-3 py-1 bg-accent-terracotta text-white text-[9px] font-black uppercase tracking-widest rounded-full">Rare</span>}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                           <button 
                            onClick={(e) => {
                              e.preventDefault();
                              (window as any).addNotification(`Protokol pembelian ${item.name} aktif. Melakukan sinkronisasi inventaris...`, 'success');
                            }}
                            className="w-full py-4 bg-white text-primary-950 font-display font-black uppercase tracking-widest text-xs hover:bg-accent-gold transition-colors active:scale-95"
                           >
                            Beli Sekarang
                           </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-accent-maroon uppercase tracking-widest">{item.origin}</p>
                        <h4 className="text-lg font-display font-black uppercase tracking-tight">{item.name}</h4>
                        <p className="text-sm font-bold text-primary-950/60">{item.price}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
