import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { sendLoginLink } from '../../../lib/firebaseClient';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSending) return;
    setIsSending(true);
    setError(null);
    try {
      await sendLoginLink(email.trim(), '/account');
      setSent(true);
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed') {
        setError('Email sign-in isn’t enabled yet on this store. Please contact support.');
      } else {
        setError('Couldn’t send the sign-in link. Please check the email address and try again.');
      }
    } finally {
      setIsSending(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-3 py-6">
        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-black text-slate-900">Check your email</h2>
        <p className="text-sm text-slate-600 max-w-xs mx-auto">
          We sent a sign-in link to <strong>{email}</strong>. Open it on this device to access your account.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center space-y-1.5 mb-2">
        <h2 className="text-lg font-black text-slate-900">Sign in to your account</h2>
        <p className="text-sm text-slate-600">
          Enter your email and we'll send you a secure sign-in link — no password needed.
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
        disabled={isSending}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#B24BF3] hover:bg-[#9f35e3] text-white font-bold text-sm shadow-md transition-all disabled:opacity-60 cursor-pointer"
      >
        {isSending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <span>Send Sign-In Link</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};
