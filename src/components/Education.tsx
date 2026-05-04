import React, { useState } from 'react';
import { BookOpen, HelpCircle, Heart, Zap, Award, Share2, ArrowRight, ExternalLink, Leaf } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { QuizModal } from './QuizModal';

const ARTICLES = [
  {
    title: "Filosofi Sirkular Pakaian Adat",
    excerpt: "Bagaimana kearifan lokal dalam pembuatan pakaian adat seperti tenun dan batik sebenarnya telah menerapkan prinsip sirkularitas sejak lama.",
    icon: Zap,
    color: "bg-primary-50 text-primary-500",
    tags: ["Budaya", "Sirkular"]
  },
  {
    title: "Limbah Tekstil Tradisional",
    excerpt: "Fakta tentang limbah dari industri pewarnaan kain tradisional dan bagaimana Lungsurin membantu menekan dampak negatifnya.",
    icon: Leaf,
    color: "bg-primary-50 text-primary-500",
    tags: ["Lingkungan", "UMKM"]
  },
  {
    title: "Seni Upcycling Wastra",
    excerpt: "Mengolah kain perca batik dan tenun menjadi produk fashion modern yang bernilai ekonomi tanpa menghilangkan nilai budayanya.",
    icon: Award,
    color: "bg-primary-50 text-primary-500",
    tags: ["Kriya", "Edukasi"]
  }
];

const QUIZZES_DATA = {
  material: {
    title: "Kuis Material Wastra",
    questions: [
      {
        id: 1,
        question: "Batu alam dan dedaunan sering digunakan dalam pewarnaan alami batik. Apa manfaat utamanya bagi sirkular fashion?",
        options: ["Warna lebih mencolok", "Ramah lingkungan & biodegradable", "Lebih murah diproduksi", "Tahan luntur selamanya"],
        correctAnswer: 1,
        explanation: "Pewarna alami bersifat biodegradable (dapat terurai), sehingga tidak mencemari ekosistem air dibandingkan pewarna sintetis."
      },
      {
        id: 2,
        question: "Apa tujuan utama dari klasifikasi 'Upcycle' pada pakaian adat bekas?",
        options: ["Dibuang ke TPA", "Dijual kembali tanpa perubahan", "Diolah menjadi produk baru bernilai tinggi", "Dibakar untuk energi"],
        correctAnswer: 2,
        explanation: "Upcycle bertujuan meningkatkan nilai guna barang bekas dengan mengubahnya menjadi sesuatu yang baru dan lebih berharga."
      }
    ]
  },
  culture: {
    title: "Sertifikasi Budaya Sirkular",
    questions: [
      {
        id: 1,
        question: "Mengapa pelestarian pakaian adat sejalan dengan konsep sustainable fashion?",
        options: ["Karena harganya mahal", "Pakaian adat biasanya dibuat untuk tahan lama (slow fashion)", "Hanya dipakai saat pesta", "Semua jawaban salah"],
        correctAnswer: 1,
        explanation: "Pakaian adat Indonesia umumnya dibuat dengan teknik tangan yang teliti dan material berkualitas tinggi, menjadikannya contoh nyata 'Slow Fashion'."
      }
    ]
  }
};

export function EducationHub() {
  const [activeQuiz, setActiveQuiz] = useState<keyof typeof QUIZZES_DATA | null>(null);

  return (
    <div className="w-full h-full pb-32">
      <div className="max-w-[1800px] mx-auto">
        <div className="p-8 md:p-12 lg:p-20 flex flex-col lg:flex-row lg:items-end justify-between gap-12 bg-batik-kawung border-b-2 border-primary-950/10 mb-12">
          <div className="flex flex-col space-y-6 lg:space-y-8 max-w-4xl">
            <div>
              <div className="flex items-center gap-3">
                <span className="tag-lime inline-block">Kearifan Lokal</span>
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-[7vw] xl:text-[10vw] font-display font-extrabold leading-[0.8] tracking-tight uppercase">Modul <br /> Budaya</h1>
            <p className="text-text-muted font-medium max-w-md text-base md:text-lg leading-relaxed">
              Pusat edukasi untuk memahami keterkaitan antara wastra Nusantara dan ekonomi sirkular modern.
            </p>
          </div>
        </div>

        <div className="item-grid mb-12 md:mb-24 px-4 sm:px-8">
          {ARTICLES.map((article, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-premium group h-auto md:min-h-[450px] flex flex-col justify-between gap-8"
            >
              <div className="space-y-6 md:space-y-8">
                <div className="w-16 md:w-20 h-16 md:h-20 bg-primary-50 rounded-2xl md:rounded-3xl flex items-center justify-center transition-all group-hover:bg-primary-500 group-hover:text-white shrink-0">
                  <article.icon size={32} strokeWidth={1.5} />
                </div>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {article.tags.map(tag => (
                    <span key={tag} className="px-3 md:px-4 py-1.5 bg-primary-50 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-display font-black leading-tight uppercase group-hover:text-primary-500 transition-colors">
                  {article.title}
                </h3>
                <p className="hidden md:block text-xs text-text-muted font-medium leading-relaxed">{article.excerpt}</p>
              </div>
              
              <button 
                onClick={() => setActiveQuiz('material')}
                className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] group-hover:translate-x-2 transition-transform py-3 px-6 bg-primary-950 text-white rounded-2xl w-fit mt-8 md:mt-auto shrink-0"
              >
                Ikuti Kuis Materi
                <ArrowRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="relative min-h-[600px] flex flex-col lg:flex-row bg-primary-900 rounded-[2rem] sm:rounded-[4rem] mx-4 sm:mx-8 text-white overflow-hidden shadow-2xl bg-batik-dark">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-primary-100 opacity-5 transform skew-x-12 translate-x-1/2 hidden lg:block" />
          
          <div className="lg:w-1/2 p-8 md:p-12 lg:p-24 flex flex-col justify-center space-y-8 md:space-y-12 relative z-10">
            <div className="space-y-8">
              <div className="mb-4 sm:mb-8">
                <span className="tag-lime inline-block">Sertifikasi UMKM Budaya</span>
              </div>
              <h2 className="text-4xl sm:text-6xl md:text-[clamp(3.5rem,7vw,10rem)] font-display font-black leading-[0.85] uppercase tracking-tight text-primary-100">Evaluasi <br /> Kompetensi</h2>
              <p className="text-white/40 text-base md:text-lg leading-relaxed max-w-md">Lulus evaluasi untuk mendapatkan badge 'Duta Wastra Sirkular' dan akses penuh ke arsip produk premium.</p>
            </div>
            <button 
              onClick={() => setActiveQuiz('culture')}
              className="btn-premium bg-primary-100 text-primary-950 hover:bg-white w-full sm:w-fit px-8 md:px-12"
            >
              Mulai Ujian Sertifikasi
            </button>
          </div>
          
          <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 p-8 md:p-12 gap-4 md:gap-6 relative z-10">
            {[
              { label: 'Quiz 01', title: 'Science of Wastra', key: 'material' },
              { label: 'Quiz 02', title: 'Ethical Sourcing', key: 'culture' },
              { label: 'Quiz 03', title: 'MSME Empowerment', key: 'material' },
              { label: 'Quiz 04', title: 'Circular Design', key: 'culture' }
            ].map((topic, i) => (
              <button 
                key={i} 
                onClick={() => setActiveQuiz(topic.key as any)}
                className="p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] bg-white/5 border border-white/10 flex flex-col items-start justify-center text-left gap-4 md:gap-8 group hover:bg-white/10 transition-all hover:scale-[1.02]"
              >
                 <div className="w-12 md:w-14 h-12 md:h-14 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                    <HelpCircle size={24} strokeWidth={1.5} className="text-primary-300 group-hover:text-white transition-colors" />
                 </div>
                 <div className="space-y-1 md:space-y-2">
                   <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{topic.label}</p>
                   <p className="text-xl md:text-2xl font-display font-black uppercase tracking-tight">{topic.title}</p>
                 </div>
              </button>
            ))}
          </div>

          {/* Graphic Element */}
          <div className="absolute -bottom-12 -right-12 opacity-5 pointer-events-none">
            <Share2 size={400} />
          </div>
        </div>

        <div className="mt-24 px-4 sm:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500">Digital Heritage</span>
              <h2 className="text-4xl md:text-6xl font-display font-black uppercase">Arsip Wastra Digital</h2>
            </div>
            <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-950 border-b-2 border-primary-950 pb-1">
              Lihat Seluruh Arsip <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { title: "Batik Parang", origin: "Solo, Jawa Tengah", image: "https://images.unsplash.com/photo-1574634534894-89d7576c8259?q=80&w=600&auto=format&fit=crop" },
              { title: "Tenun Ikat", origin: "Sumba, NTT", image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=600&auto=format&fit=crop" },
              { title: "Songket", origin: "Palembang, Sumsel", image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop" },
              { title: "Ulos", origin: "Batak, Sumut", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="group cursor-pointer"
                onClick={() => (window as any).addNotification(`Membuka arsip detail ${item.title}...`, 'info')}
              >
                <div className="aspect-[3/4] overflow-hidden rounded-3xl mb-4 relative">
                  <img 
                    src={item.image} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                </div>
                <h4 className="text-lg font-display font-black uppercase tracking-tight">{item.title}</h4>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{item.origin}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <QuizModal 
        isOpen={!!activeQuiz} 
        onClose={() => setActiveQuiz(null)} 
        title={activeQuiz ? QUIZZES_DATA[activeQuiz].title : ""}
        questions={activeQuiz ? QUIZZES_DATA[activeQuiz].questions : []}
        onComplete={(score) => {
          (window as any).addNotification(`Selamat! Anda menyelesaikan evaluasi dengan skor ${score}/${activeQuiz ? QUIZZES_DATA[activeQuiz].questions.length : 0}.`, 'success');
        }}
      />
    </div>
  );
}

