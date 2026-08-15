import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MarqueeBanner } from './components/MarqueeBanner';
import { CollectionsGrid } from './components/CollectionsGrid';
import { EmailCapture } from './components/EmailCapture';
import { Footer } from './components/Footer';
import { RecentOrdersToast } from './components/RecentOrdersToast';
import { trackPageview } from '../../lib/trackPageview';

export default function App() {
  useEffect(() => {
    trackPageview('home');
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8FC] font-sans text-slate-800 selection:bg-[#B24BF3] selection:text-white">
      <Header />
      <Hero />
      <MarqueeBanner />
      <CollectionsGrid />
      <EmailCapture />
      <Footer />
      <RecentOrdersToast />
    </div>
  );
}
