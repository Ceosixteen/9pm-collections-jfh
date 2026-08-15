import React, { useEffect, useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, Loader2, LogOut } from 'lucide-react';
import type { User } from 'firebase/auth';
import {
  watchAuthState,
  isLoginLink,
  completeLoginWithLink,
  getPendingEmail,
  sendLoginLink,
  getIdToken,
  logout,
} from '../lib/firebaseClient';

export interface CheckoutAutofillData {
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
}

interface CheckoutSignInProps {
  onAutofill: (data: CheckoutAutofillData) => void;
}

/**
 * Optional "sign in with email" panel shown inside checkout, alongside the
 * default guest checkout flow. Returning customers can sign in with a
 * passwordless email link and have their name/phone/address autofilled
 * from their most recent order — guest checkout remains fully unchanged.
 */
export const CheckoutSignIn: React.FC<CheckoutSignInProps> = ({ onAutofill }) => {
  const [user, setUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Watch Firebase auth state so a returning session (or a just-completed
  // sign-in) is reflected here immediately.
  useEffect(() => {
    const unsubscribe = watchAuthState(setUser);
    return unsubscribe;
  }, []);

  // If the customer arrived here by tapping their magic sign-in link, finish
  // the sign-in and clean the URL back to the plain landing page path.
  useEffect(() => {
    const href = window.location.href;
    if (!isLoginLink(href)) return;
    const pendingEmail = getPendingEmail();
    if (!pendingEmail) return; // opened on a different device — nothing to auto-complete here
    setIsCompleting(true);
    completeLoginWithLink(href)
      .catch(() => setError('That sign-in link is invalid or expired. Please request a new one.'))
      .finally(() => {
        setIsCompleting(false);
        window.history.replaceState({}, '', window.location.pathname);
      });
  }, []);

  // Once signed in, pull the customer's most recent order to autofill the
  // checkout form. Falls back to just the verified email if there's no
  // order history yet or the lookup fails.
  useEffect(() => {
    if (!user?.email) return;
    const email = user.email;
    (async () => {
      try {
        const token = await getIdToken();
        if (!token) {
          onAutofill({ email });
          return;
        }
        const res = await fetch('/api/my-orders', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
          onAutofill({ email });
          return;
        }
        const orders = await res.json();
        const latest = Array.isArray(orders) && orders.length > 0 ? orders[0] : null;
        onAutofill({
          email,
          name: latest?.customerName,
          phone: latest?.customerPhone,
          address: latest?.deliveryAddress,
          city: latest?.deliveryCity,
        });
      } catch {
        onAutofill({ email });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim() || isSending) return;
    setIsSending(true);
    setError(null);
    try {
      await sendLoginLink(email.trim(), window.location.pathname);
      setLinkSent(true);
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed') {
        setError('Email sign-in isn’t enabled yet — please check out as a guest below.');
      } else {
        setError('Couldn’t send the sign-in link. Please check the email and try again.');
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
  };

  if (isCompleting) {
    return (
      <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        <span>Signing you in...</span>
      </div>
    );
  }

  if (user?.email) {
    return (
      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="truncate">
            Signed in as <strong>{user.email}</strong> — your details are autofilled below.
          </span>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold shrink-0 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    );
  }

  if (linkSent) {
    return (
      <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>Check your email — tap the link to come right back here, signed in.</span>
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="w-full p-3 rounded-2xl bg-white border border-dashed border-gray-300 text-xs font-bold text-slate-700 hover:border-[#B24BF3] hover:text-[#B24BF3] transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <Mail className="w-4 h-4" />
        <span>Sign in with email to autofill your details</span>
      </button>
    );
  }

  // Deliberately a <div>, not a <form> — this panel renders inside the
  // checkout drawer's own outer <form>, and nested <form> elements are
  // invalid HTML that browsers handle inconsistently (some hijack the
  // submit into a real page navigation). Enter-to-submit is wired manually
  // via onKeyDown instead.
  return (
    <div className="p-3.5 rounded-2xl bg-slate-50 border border-gray-200 space-y-2">
      <p className="text-[11px] font-bold text-slate-700">Sign in to autofill your name, phone & address</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="you@example.com"
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-slate-900 focus:outline-none focus:border-[#B24BF3]"
        />
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={isSending}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#B24BF3] hover:bg-[#9f35e3] text-white text-xs font-bold transition-all disabled:opacity-60 cursor-pointer shrink-0"
        >
          {isSending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <span>Send Link</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
      {error && <p className="text-[11px] text-red-600">{error}</p>}
      <button
        type="button"
        onClick={() => setShowForm(false)}
        className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
      >
        Never mind, I'll check out as a guest
      </button>
    </div>
  );
};
