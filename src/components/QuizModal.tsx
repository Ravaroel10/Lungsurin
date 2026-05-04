import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ChevronRight, Award, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  questions: Question[];
  onComplete?: (score: number) => void;
}

export function QuizModal({ isOpen, onClose, title, questions, onComplete }: QuizModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleAnswerSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    if (index === questions[currentStep].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(c => c + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
      if (onComplete) onComplete(score);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 py-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary-950/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white border-2 border-primary-950 shadow-2xl overflow-hidden"
          >
            <div className="bg-primary-950 text-white p-6 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-400 mb-1">Knowledge Evaluation</p>
                <h3 className="text-xl font-display font-black uppercase">{title}</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 sm:p-12">
              {!showResult ? (
                <div className="space-y-8">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-primary-950/40">
                    <span>Question {currentStep + 1} of {questions.length}</span>
                    <span>Progress: {Math.round(((currentStep + 1) / questions.length) * 100)}%</span>
                  </div>

                  <div className="w-full bg-primary-50 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      className="bg-primary-500 h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                    />
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-2xl font-display font-black leading-tight text-primary-950">
                      {questions[currentStep].question}
                    </h4>

                    <div className="grid gap-3">
                      {questions[currentStep].options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAnswerSelect(idx)}
                          disabled={isAnswered}
                          className={cn(
                            "w-full p-5 text-left border-2 transition-all flex items-center justify-between font-bold",
                            !isAnswered && "border-primary-50 hover:border-primary-500 hover:bg-primary-50 active:scale-[0.99]",
                            isAnswered && idx === questions[currentStep].correctAnswer && "border-emerald-500 bg-emerald-50 text-emerald-900",
                            isAnswered && selectedAnswer === idx && idx !== questions[currentStep].correctAnswer && "border-rose-500 bg-rose-50 text-rose-900",
                            isAnswered && selectedAnswer !== idx && idx !== questions[currentStep].correctAnswer && "border-primary-50 opacity-40"
                          )}
                        >
                          <span>{option}</span>
                          {isAnswered && idx === questions[currentStep].correctAnswer && <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {isAnswered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "p-6 border-l-4 rounded-r-xl",
                        selectedAnswer === questions[currentStep].correctAnswer 
                          ? "bg-emerald-50 border-emerald-500" 
                          : "bg-rose-50 border-rose-500"
                      )}
                    >
                      <div className="flex gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                          selectedAnswer === questions[currentStep].correctAnswer ? "bg-emerald-100" : "bg-rose-100"
                        )}>
                          {selectedAnswer === questions[currentStep].correctAnswer ? <CheckCircle2 size={24} className="text-emerald-600" /> : <AlertCircle size={24} className="text-rose-600" />}
                        </div>
                        <div className="space-y-1">
                          <p className="font-display font-black uppercase text-xs tracking-widest text-primary-950">Insight Edukasi</p>
                          <p className="text-sm font-medium leading-relaxed text-primary-950/70">{questions[currentStep].explanation}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleNext}
                        className="mt-6 w-full py-4 bg-primary-950 text-white font-display font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-primary-800 transition-all"
                      >
                        {currentStep === questions.length - 1 ? "Lihat Hasil" : "Next Question"} <ChevronRight size={18} />
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-8 py-4">
                  <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award size={48} className="text-primary-500" />
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-3xl font-display font-black uppercase tracking-tight text-primary-950">Evaluasi Selesai</h4>
                    <p className="text-primary-950/60 font-medium">Anda berhasil menjawab {score} dari {questions.length} pertanyaan dengan benar.</p>
                  </div>

                  <div className="p-8 border-2 border-primary-950 bg-primary-50 inline-block w-full">
                    <div className="flex justify-around items-center">
                      <div>
                        <p className="text-[10px] font-black uppercase text-primary-900/40 tracking-widest mb-1">Akurasi</p>
                        <p className="text-4xl font-display font-black text-primary-950">{Math.round((score / questions.length) * 100)}%</p>
                      </div>
                      <div className="w-px h-12 bg-primary-950/10" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-primary-900/40 tracking-widest mb-1">Poin Didapat</p>
                        <p className="text-4xl font-display font-black text-emerald-600">+{score * 25}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={resetQuiz}
                      className="py-4 border-2 border-primary-950 font-display font-black uppercase tracking-widest text-xs hover:bg-primary-50 transition-all"
                    >
                      Ulangi Kuis
                    </button>
                    <button
                      onClick={onClose}
                      className="py-4 bg-primary-950 text-white font-display font-black uppercase tracking-widest text-xs hover:bg-primary-800 transition-all"
                    >
                      Kembali ke Hub
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
