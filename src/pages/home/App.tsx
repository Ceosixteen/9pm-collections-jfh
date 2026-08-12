import React from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MarqueeBanner } from './components/MarqueeBanner';
import { CollectionsGrid } from './components/CollectionsGrid';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#FAF8FC] font-sans text-slate-800 selection:bg-[#B24BF3] selection:text-white">
      <Header />
      <Hero />
      <MarqueeBanner />
      <CollectionsGrid />
      <Footer />
    </div>
  );
}
