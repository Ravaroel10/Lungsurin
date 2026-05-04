import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatRp = (amount: number) => {
  return 'Rp' + amount.toLocaleString('id-ID');
};

export const formatDate = (date: any) => {
  if (!date) return 'Not set';
  
  try {
    let d: Date;
    
    // Handle Firestore Timestamps
    if (date && typeof date === 'object' && 'seconds' in date) {
      d = new Date(date.seconds * 1000);
    } else {
      d = new Date(date);
    }

    if (isNaN(d.getTime())) return 'Invalid Date';

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  } catch (error) {
    console.error("formatDate error:", error);
    return 'Invalid Date';
  }
};
