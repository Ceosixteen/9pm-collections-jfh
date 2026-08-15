import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { User } from 'firebase/auth';
import { watchAuthState, isLoginLink, completeLoginWithLink, getPendingEmail } from '../../lib/firebaseClient';
import { LoginScreen } from './components/LoginScreen';
import { ConfirmEmailScreen } from './components/ConfirmEmailScreen';
import { OrdersDashboard } from './components/OrdersDashboard';
import { NotificationsBell } from './components/NotificationsBell';

type Phase = 'checking' | 'needsEmailConfirmation' | 'ready';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [phase, setPhase] = useState<Phase>('checking');
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribed = false;

    const completeSignInIfNeeded = async () => {
      if (!isLoginLink(window.location.href)) {
        return;
      }

      const pendingEmail = getPendingEmail();
      if (!pendingEmail) {
        setPhase('needsEmailConfirmation');
        return;
      }

      try {
        await completeLoginWithLink(window.location.href);
        // Clean the magic-link params out of the URL so a refresh doesn't
        // try to re-consume an already-used link.
        window.history.replaceState({}, '', '/account');
      } catch {
        setLinkError('This sign-in link has expired or already been used. Please request a new one.');
      }
    };

    completeSignInIfNeeded();

    const unsubscribe = watchAuthState((nextUser) => {
      if (unsubscribed) return;
      setUser(nextUser);
      setPhase((prev) => (prev === 'needsEmailConfirmation' ? prev : 'ready'));
    });

    return () => {
      unsubscribed = true;
      unsubscribe();
    };
  }, []);

  const handleConfirmEmail = async (email: string) => {
    await completeLoginWithLink(window.location.href, email);
    window.history.replaceState({}, '', '/account');
    setPhase('ready');
  };

  return (
    <div className="min-h-screen bg-[#FAF8FC] font-sans text-slate-800">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200/80 py-3">
        <div className="max-w-md mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/images/juba_fashion_hub_logo.jpg"
              alt="Juba Fashion Hub"
              className="h-8 w-auto object-contain rounded-md"
              referrerPolicy="no-referrer"
            />
          </Link>
          <div className="flex items-center gap-2.5">
            {phase === 'ready' && user && (
              <NotificationsBell onUnauthorized={() => setUser(null)} />
            )}
            <Link to="/" className="text-xs font-bold text-slate-500 hover:text-[#B24BF3]">
              ← Back to Shop
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
          {phase === 'checking' && (
            <div className="flex items-center justify-center py-10 text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          )}

          {phase === 'needsEmailConfirmation' && (
            <ConfirmEmailScreen onConfirm={handleConfirmEmail} />
          )}

          {phase === 'ready' && (
            <>
              {linkError && (
                <p className="text-xs text-red-600 text-center mb-4">{linkError}</p>
              )}
              {user ? (
                <OrdersDashboard user={user} onSignedOut={() => setUser(null)} />
              ) : (
                <LoginScreen />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
