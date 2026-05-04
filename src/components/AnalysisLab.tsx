import React from 'react';
import { AIAnalysis } from './AIAnalysis';

export function AnalysisLab() {
  return (
    <div className="w-full h-full pb-32">
      <div className="max-w-[1800px] mx-auto">
        <div className="p-8 md:p-12 lg:p-24 modular-border border-t-0 border-x-0 space-y-12 bg-batik-megamendung">
          <div className="space-y-4 max-w-4xl">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-clay">Ekosistem Cerdas</p>
            <h1 className="text-4xl sm:text-6xl lg:text-[7vw] font-display font-black leading-none tracking-tight uppercase">Laboratorium <br /> Analisis AI</h1>
            <p className="text-text-muted font-medium max-w-xl text-base md:text-lg leading-relaxed">
              Jaringan neural canggih kami mengevaluasi setiap pakaian untuk menentukan jalur sirkular optimalnya. Kami tidak hanya mendaur ulang; kami berevolusi.
            </p>
          </div>
        </div>
        
        <AIAnalysis />
        
        <div className="item-grid modular-border border-t-0 border-x-0">
          {[
            { step: '01', title: 'Snap a Photo', desc: 'Capture clear imagery of the textile structure, labels, and any visible wear.' },
            { step: '02', title: 'AI Inspection', desc: 'Gemini-powered vision analysis assesses brand, condition, and circular potential.' },
            { step: '03', title: 'Circular Path', desc: 'Execute the recommended action—Resale, Repair, or curated Upcycling.' }
          ].map((item, i) => (
            <div key={i} className="grid-item space-y-8 min-h-[300px] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-4xl font-display font-black text-primary-200">{item.step}</div>
                <h3 className="text-3xl leading-none">{item.title}</h3>
                <p className="text-xs text-text-muted font-medium uppercase tracking-widest leading-loose">{item.desc}</p>
              </div>
              <div className="h-[2px] w-12 bg-primary-900/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
