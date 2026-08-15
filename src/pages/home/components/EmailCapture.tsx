import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

export const EmailCapture: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'homepage', storeSlug: 'home' }),
      });
      if (!res.ok) throw new Error('Failed');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-14 sm:py-16 bg-gradient-to-r from-[#B24BF3] to-[#8B2FD6]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
          Get -$5 Off Your First Order
        </h2>
        <p className="text-sm text-white/85 mb-6">
          Join our list for early access to new arrivals, restocks, and exclusive deals across every collection.
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/15 text-white font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            You're on the list! Watch your inbox for a discount code.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto">
            <div className="relative flex-1 w-full">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-full border-0 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-3 rounded-full bg-[#18181B] hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all disabled:opacity-60 cursor-pointer shrink-0"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <span>Join</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
        {error && <p className="text-xs text-white/90 mt-2">{error}</p>}
      </div>
    </section>
  );
};
