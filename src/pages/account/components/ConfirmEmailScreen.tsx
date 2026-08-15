import React, { useState } from 'react';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';

interface ConfirmEmailScreenProps {
  onConfirm: (email: string) => Promise<void>;
}

// Shown when the customer opens their sign-in link on a different device or
// browser than the one they requested it from — we don't have their email
// stashed in localStorage, so we ask them to confirm it before completing
// sign-in (Firebase requires the email to match the one the link was sent to).
export const ConfirmEmailScreen: React.FC<ConfirmEmailScreenProps> = ({ onConfirm }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm(email.trim());
    } catch {
      setError('That email doesn’t match this sign-in link. Please double-check and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center space-y-1.5 mb-2">
        <h2 className="text-lg font-black text-slate-900">Confirm your email</h2>
        <p className="text-sm text-slate-600">
          Please re-enter the email address this sign-in link was sent to.
        </p>
      </div>

      <div className="relative">
        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full pl-10 pr-4 py-3 rounded-full bg-slate-50 border border-gray-200 text-sm text-slate-900 focus:outline-none focus:border-[#B24BF3] focus:bg-white"
        />
      </div>

      {error && <p className="text-xs text-red-600 text-center">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#B24BF3] hover:bg-[#9f35e3] text-white font-bold text-sm shadow-md transition-all disabled:opacity-60 cursor-pointer"
      >
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
          <>
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};
