import React, { useState } from 'react';
import { X, Sparkles, ArrowRight, RotateCcw, ShoppingBag } from 'lucide-react';
import { PerfumeProduct, Currency } from '../types';

interface FragranceQuizModalProps {
  perfumes: PerfumeProduct[];
  currency: Currency;
  onClose: () => void;
  onAddToCart: (perfume: PerfumeProduct) => void;
}

export const FragranceQuizModal: React.FC<FragranceQuizModalProps> = ({
  perfumes,
  currency,
  onClose,
  onAddToCart,
}) => {
  const [step, setStep] = useState<number>(1);
  const [timePreference, setTimePreference] = useState<string>('night');
  const [vibePreference, setVibePreference] = useState<string>('sweet');
  const [result, setResult] = useState<PerfumeProduct | null>(null);

  const handleCalculateResult = (vibeChoice: string) => {
    setVibePreference(vibeChoice);

    let match: PerfumeProduct | undefined;

    if (vibeChoice === 'saffron_oud') {
      match = perfumes.find((p) => p.id === 'oud-black');
    } else if (vibeChoice === 'rose_amber') {
      match = perfumes.find((p) => p.id === 'oud-amethyst');
    } else if (vibeChoice === 'litchi_jasmine') {
      match = perfumes.find((p) => p.id === 'oud-sublime');
    } else if (vibeChoice === 'rose_milk') {
      match = perfumes.find((p) => p.id === 'oud-noble-blush');
    } else if (vibeChoice === 'pineapple_creme') {
      match = perfumes.find((p) => p.id === 'oud-white');
    } else {
      match = perfumes.find((p) => p.id === 'oud-black');
    }

    setResult(match || perfumes[0]);
    setStep(3);
  };

  const handleReset = () => {
    setStep(1);
    setResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-white border border-gray-200 p-6 sm:p-8 overflow-hidden shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 text-slate-700 hover:bg-gray-200 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#B24BF3] text-xs font-extrabold uppercase border border-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-[#B24BF3]" />
            SCENT FINDER QUIZ
          </span>
          <h3 className="text-2xl font-black text-slate-900">
            Find Your Signature Fragrance
          </h3>
          <p className="text-xs text-slate-600 font-normal">
            Answer 2 quick questions to discover your ideal scent match in Juba.
          </p>
        </div>

        {/* Question 1 */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h4 className="text-sm font-extrabold text-slate-900 text-center">
              1. When do you plan to wear this fragrance most in Juba?
            </h4>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setTimePreference('night');
                  setStep(2);
                }}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-gray-200 hover:border-purple-300 text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-slate-900 block text-sm">🌙 Evenings, Lounge Parties & Dates</span>
                  <span className="text-xs text-slate-500">Intense, warm, beast-mode projection for nightlife.</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#B24BF3] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  setTimePreference('day');
                  setStep(2);
                }}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-gray-200 hover:border-purple-300 text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-slate-900 block text-sm">☀️ Workplace, Daytime Meetings & Daily Wear</span>
                  <span className="text-xs text-slate-500">Fresh, aquatic, zesty citrus for Juba heat.</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#B24BF3] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  setTimePreference('feminine');
                  setStep(2);
                }}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-gray-200 hover:border-purple-300 text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-slate-900 block text-sm">💕 Alluring Feminine Elegant Wear</span>
                  <span className="text-xs text-slate-500">Soft florals, white jasmine, and powdery vanilla musk.</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#B24BF3] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* Question 2 */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <h4 className="text-sm font-extrabold text-slate-900 text-center">
              2. Which fragrance notes sound most appealing to you?
            </h4>

            <div className="space-y-2">
              <button
                onClick={() => handleCalculateResult('saffron_oud')}
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-gray-200 hover:border-purple-300 text-left transition-all cursor-pointer"
              >
                <span className="font-bold text-slate-900 block text-xs sm:text-sm">Saffron, Natural Oud Wood & Deep Musk</span>
                <span className="text-[11px] text-slate-500">Majestic, warm, and commanding nocturnal vibe.</span>
              </button>

              <button
                onClick={() => handleCalculateResult('rose_amber')}
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-gray-200 hover:border-purple-300 text-left transition-all cursor-pointer"
              >
                <span className="font-bold text-slate-900 block text-xs sm:text-sm">Turkish Rose, Amber & Agarwood</span>
                <span className="text-[11px] text-slate-500">Opulent, romantic, and richly floral for evenings.</span>
              </button>

              <button
                onClick={() => handleCalculateResult('litchi_jasmine')}
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-gray-200 hover:border-purple-300 text-left transition-all cursor-pointer"
              >
                <span className="font-bold text-slate-900 block text-xs sm:text-sm">Litchi, Jasmine & Creamy Patchouli</span>
                <span className="text-[11px] text-slate-500">Fresh, juicy, and vibrant for daytime wear.</span>
              </button>

              <button
                onClick={() => handleCalculateResult('rose_milk')}
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-gray-200 hover:border-purple-300 text-left transition-all cursor-pointer"
              >
                <span className="font-bold text-slate-900 block text-xs sm:text-sm">Rose Milk, Almond & Sandalwood</span>
                <span className="text-[11px] text-slate-500">Soft, sweet, and velvety gourmand elegance.</span>
              </button>

              <button
                onClick={() => handleCalculateResult('pineapple_creme')}
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-gray-200 hover:border-purple-300 text-left transition-all cursor-pointer"
              >
                <span className="font-bold text-slate-900 block text-xs sm:text-sm">Pineapple, Crème Brûlée & Warm Spice</span>
                <span className="text-[11px] text-slate-500">Decadent, sweet, and complex for any season.</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Result */}
        {step === 3 && result && (
          <div className="space-y-4 animate-fadeIn text-center">
            <span className="text-xs font-extrabold text-[#B24BF3] uppercase tracking-wider block">
              🎉 YOUR PERFECT MATCH FOUND:
            </span>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-3">
              <div className="w-28 h-36 mx-auto rounded-xl overflow-hidden border border-gray-200 shadow-md">
                <img
                  src={result.image}
                  alt={result.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <h4 className="text-xl font-extrabold text-slate-900">{result.name}</h4>
                <p className="text-xs text-slate-600 font-medium">{result.tagline}</p>
              </div>

              <div className="text-lg font-black text-[#B24BF3]">
                {currency === 'SSP' ? `SSP ${(result.priceUSD * 8000).toLocaleString()}` : `$${result.priceUSD}`}
              </div>

              <div className="p-2 rounded-lg bg-white border border-gray-200 text-[11px] text-slate-700">
                <strong>Projection:</strong> {result.projection} · <strong>Longevity:</strong> {result.longevity}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="w-1/3 py-3 rounded-full bg-gray-100 text-slate-800 text-xs font-bold hover:bg-gray-200 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>

              <button
                onClick={() => {
                  onAddToCart(result);
                  onClose();
                }}
                className="w-2/3 py-3 rounded-full bg-[#B24BF3] hover:bg-[#9f35e3] text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add Match to Cart</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
