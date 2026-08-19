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
  const [timePreference, setTimePreference] = useState<string>('oily');
  const [vibePreference, setVibePreference] = useState<string>('normal_daily');
  const [result, setResult] = useState<PerfumeProduct | null>(null);

  const handleCalculateResult = (vibeChoice: string) => {
    setVibePreference(vibeChoice);

    let match: PerfumeProduct | undefined;

    if (vibeChoice === 'dullness_tone') {
      match = perfumes.find((p) => p.id === 'medix-vitc-turmeric-lotion');
    } else if (vibeChoice === 'firmness_aging') {
      match = perfumes.find((p) => p.id === 'medix-retinol-ferulic-cream');
    } else if (vibeChoice === 'dryness_repair') {
      match = perfumes.find((p) => p.id === 'medix-argan-vite-cream');
    } else if (vibeChoice === 'irritation_dehydration') {
      match = perfumes.find((p) => p.id === 'medix-hyaluronic-cica-cream');
    } else {
      match = perfumes.find((p) => p.id === 'medix-argan-vite-cream');
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
            SKIN FINDER QUIZ
          </span>
          <h3 className="text-2xl font-black text-slate-900">
            Find Your Perfect Medix 5.5 Match
          </h3>
          <p className="text-xs text-slate-600 font-normal">
            Answer 2 quick questions to discover your ideal body treatment in Juba.
          </p>
        </div>

        {/* Question 1 */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h4 className="text-sm font-extrabold text-slate-900 text-center">
              1. What's your body skin dealing with right now?
            </h4>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setTimePreference('dull');
                  setStep(2);
                }}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-gray-200 hover:border-purple-300 text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-slate-900 block text-sm">✨ Dull, Uneven Tone or Dark Spots</span>
                  <span className="text-xs text-slate-500">Needs brightening and sun-damage recovery.</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#B24BF3] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  setTimePreference('dry');
                  setStep(2);
                }}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-gray-200 hover:border-purple-300 text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-slate-900 block text-sm">🌵 Dry, Flaky & Weather-Torn</span>
                  <span className="text-xs text-slate-500">Craves deep, lasting moisture rescue.</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#B24BF3] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  setTimePreference('firm');
                  setStep(2);
                }}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-gray-200 hover:border-purple-300 text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-slate-900 block text-sm">🕰️ Losing Firmness or Fine Lines</span>
                  <span className="text-xs text-slate-500">Wants smoothing, firming, anti-aging care.</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#B24BF3] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  setTimePreference('irritated');
                  setStep(2);
                }}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-gray-200 hover:border-purple-300 text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-slate-900 block text-sm">💧 Dehydrated & Irritated</span>
                  <span className="text-xs text-slate-500">Wants plump, calm, soothed skin.</span>
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
              2. Which ingredient benefit sounds most like what you need?
            </h4>

            <div className="space-y-2">
              <button
                onClick={() => handleCalculateResult('dullness_tone')}
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-gray-200 hover:border-purple-300 text-left transition-all cursor-pointer"
              >
                <span className="font-bold text-slate-900 block text-xs sm:text-sm">Vitamin C & Turmeric Brightening</span>
                <span className="text-[11px] text-slate-500">Fades dark spots and evens out skin tone fast.</span>
              </button>

              <button
                onClick={() => handleCalculateResult('firmness_aging')}
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-gray-200 hover:border-purple-300 text-left transition-all cursor-pointer"
              >
                <span className="font-bold text-slate-900 block text-xs sm:text-sm">Retinol & Ferulic Acid Age-Rewind</span>
                <span className="text-[11px] text-slate-500">Smooths crepey skin and firms sagging areas over time.</span>
              </button>

              <button
                onClick={() => handleCalculateResult('dryness_repair')}
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-gray-200 hover:border-purple-300 text-left transition-all cursor-pointer"
              >
                <span className="font-bold text-slate-900 block text-xs sm:text-sm">Argan Oil & Vitamin E Deep Moisture</span>
                <span className="text-[11px] text-slate-500">Locks in hours of relief for dry, flaky skin.</span>
              </button>

              <button
                onClick={() => handleCalculateResult('irritation_dehydration')}
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-gray-200 hover:border-purple-300 text-left transition-all cursor-pointer"
              >
                <span className="font-bold text-slate-900 block text-xs sm:text-sm">Hyaluronic Acid & Cica Soothing</span>
                <span className="text-[11px] text-slate-500">Plumps with moisture and calms stressed skin.</span>
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
                <strong>Texture:</strong> {result.projection} · <strong>Results:</strong> {result.longevity}
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
