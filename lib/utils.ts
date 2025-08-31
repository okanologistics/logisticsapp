import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₦0.00';
  }
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount);
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return 'N/A';
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return 'Invalid Date';
  return parsedDate.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatPhone(phone: string): string {
  return phone?.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') || '';
}
