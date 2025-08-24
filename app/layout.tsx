import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://okanologistics.com'),
  title: 'Okano Logistic Services - Delivering Faster, Smarter, Better',
  description: 'Powering comfort, speed, and satisfaction across Nigeria\'s logistics space. Invest in delivery bikes and earn passive income.',
  keywords: 'logistics, delivery, Nigeria, bike investment, passive income, express delivery, haulage'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white font-sans text-gray-900 antialiased">
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}