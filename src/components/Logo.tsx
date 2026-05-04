import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'full' | 'icon' | 'large';
}

export const Logo: React.FC<LogoProps> = ({ className, size = 32, variant = 'full' }) => {
  const isLarge = variant === 'large';
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        style={{ width: size, height: size }} 
        className="relative flex items-center justify-center shrink-0"
      >
        <img 
          src="https://raw.githubusercontent.com/Ravaroel10/COZY/main/Screenshot_2026-04-28_105050-removebg-preview.png"
          alt="Lungsurin Symbol"
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
      {(variant === 'full' || variant === 'large') && (
        <span className={`font-serif font-black text-[#8B1A1A] leading-none whitespace-nowrap ${
          isLarge 
            ? "block text-[2em] sm:text-[2.6em] lg:text-[3.2em] -mt-2" 
            : "hidden sm:block text-[1.4em] lg:text-[2em] -mt-1"
        }`}>
          Lungsur<span className="relative inline-flex items-center leading-none">
            <span className={`absolute left-1/2 -translate-x-1/2 bg-[#D4AF37] rotate-45 shadow-[1px_1px_2px_rgba(0,0,0,0.1)] ${
              isLarge ? "w-[0.25em] h-[0.25em] -top-[0.01em]" : "w-[0.22em] h-[0.22em] -top-[0.05em]"
            }`} />
            ı
          </span>n
        </span>
      )}
    </div>
  );
};
