import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Recycle, ShieldCheck, TrendingUp, ArrowRight } from 'lucide-react';
import { Logo } from './Logo';

export function IntroModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Warisan Budaya Berlanjut",
      description: "Platform circular fashion berbasis AI khusus pakaian adat Indonesia. Lestarikan busana tradisional sambil mengurangi limbah tekstil.",
      icon: <Sparkles className="w-8 h-8 text-primary-500" />,
      color: "bg-primary-50"
    },
    {
      title: "Klasifikasi AI Cerdas",
      description: "Unggah foto pakaian adat Anda. AI kami akan mengklasifikasikannya ke jalur Reuse, Resale, Upcycle, atau Recycle secara otomatis.",
      icon: <Recycle className="w-8 h-8 text-emerald-500" />,
      color: "bg-emerald-50"
    },
    {
      title: "Pemberdayaan Pengrajin",
      description: "Kami menghubungkan Anda dengan pengrajin lokal dan UMKM budaya untuk mengolah kain bekas menjadi produk bernilai ekonomi tinggi.",
      icon: <ShieldCheck className="w-8 h-8 text-accent-clay" />,
      color: "bg-orange-50"
    },
    {
      title: "Tingkatkan Impact Anda",
      description: "Dapatkan poin kontribusi setiap kali Anda melakukan transaksi sirkular. Pantau dampak lingkungan positif yang telah Anda berikan.",
      icon: <TrendingUp className="w-8 h-8 text-primary-600" />,
      color: "bg-indigo-50"
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-primary-950/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white overflow-hidden shadow-2xl border-2 border-primary-950"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-primary-50 transition-colors z-10"
            >
              <X size={20} className="text-primary-950" />
            </button>

            <div className="p-8 sm:p-12">
              <div className="flex justify-center mb-8">
                <Logo size={48} variant="icon" />
              </div>

              <div className="space-y-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6 text-center"
                  >
                    <div className={`w-16 h-16 ${steps[step].color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                      {steps[step].icon}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-display font-black uppercase tracking-tight text-primary-950 leading-tight">
                      {steps[step].title}
                    </h3>
                    <p className="text-primary-950/60 font-medium leading-relaxed">
                      {steps[step].description}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div className="flex justify-center gap-2">
                  {steps.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 transition-all duration-300 ${i === step ? 'w-8 bg-primary-950' : 'w-2 bg-primary-950/10'}`}
                    />
                  ))}
                </div>

                <div className="pt-4">
                  {step < steps.length - 1 ? (
                    <button
                      onClick={() => setStep(step + 1)}
                      className="w-full py-4 bg-primary-950 text-white font-display font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-primary-800 transition-all active:scale-[0.98]"
                    >
                      Lanjut <ArrowRight size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={onClose}
                      className="w-full py-4 bg-primary-500 text-white font-display font-black uppercase tracking-widest text-sm hover:bg-primary-600 transition-all active:scale-[0.98] shadow-lg shadow-primary-500/20"
                    >
                      Mulai Sekarang
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Decoration */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-accent-clay to-emerald-500" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
