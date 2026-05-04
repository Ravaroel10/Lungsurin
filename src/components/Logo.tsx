import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'full' | 'icon';
}

export const Logo: React.FC<LogoProps> = ({ className, size = 32, variant = 'full' }) => {
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
      {variant === 'full' && (
        <span className="hidden sm:block font-display font-black text-[1.4em] lg:text-[1.8em] tracking-tight text-primary-950 leading-none whitespace-nowrap mt-0.5 uppercase">
          Lungsur<span className="relative inline-flex items-center leading-none">
            <span className="absolute -top-[0.2em] left-1/2 -translate-x-1/2 w-[0.22em] h-[0.22em] bg-accent-clay rotate-45" />
            i
          </span>n
        </span>
      )}
    </div>
  );
};
