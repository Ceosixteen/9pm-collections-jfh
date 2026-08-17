import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar, AdminView } from './components/Sidebar';
import { OverviewView } from './components/OverviewView';
import { OrdersView } from './components/OrdersView';
import { ClientsView } from './components/ClientsView';
import { LandingPagesView } from './components/LandingPagesView';
import { HelpRequestsView } from './components/HelpRequestsView';
import { LeadsView } from './components/LeadsView';
import { CampaignsView } from './components/CampaignsView';
import { ProductsView } from './components/ProductsView';
import { CollectionsView } from './components/CollectionsView';

export default function App() {
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'anonymous'>('checking');
  const [activeView, setActiveView] = useState<AdminView>('overview');

  useEffect(() => {
    document.title = 'Juba Fashion Hub | Back Office';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/session', { credentials: 'include' });
        const data = await res.json();
        setAuthState(data.authenticated ? 'authenticated' : 'anonymous');
      } catch {
        setAuthState('anonymous');
      }
    })();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // Ignore — we still bounce to the login screen locally.
    }
    setAuthState('anonymous');
  };

  const handleUnauthorized = () => setAuthState('anonymous');

  if (authState === 'checking') {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#B24BF3] animate-spin" />
      </div>
    );
  }

  if (authState === 'anonymous') {
    return <LoginScreen onLoginSuccess={() => setAuthState('authenticated')} />;
  }

  const VIEW_TITLES: Record<AdminView, { title: string; subtitle: string }> = {
    overview: { title: 'Overview', subtitle: 'Everything at a glance, across every collection.' },
    orders: { title: 'Orders', subtitle: 'Every order placed across all landing pages.' },
    products: { title: 'Products', subtitle: 'Add, edit, import and export your entire product catalogue.' },
    collections: { title: 'Collections', subtitle: 'Create and edit landing pages — no code, no deploy.' },
    clients: { title: 'Clients', subtitle: 'Customers aggregated by phone number, across all collections.' },
    pages: { title: 'Landing Pages', subtitle: 'Sales and traffic broken down per storefront.' },
    leads: { title: 'Email Leads', subtitle: 'Customers who joined the mailing list for discounts and drops.' },
    campaigns: { title: 'Campaigns', subtitle: 'Send announcements and offers to every signed-in customer.' },
    help: { title: 'Help Requests', subtitle: 'Customer support queries forwarded by Amina.' },
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Sidebar activeView={activeView} onSelectView={setActiveView} onLogout={handleLogout} />

      <main className="pl-16 sm:pl-56">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-white">{VIEW_TITLES[activeView].title}</h1>
            <p className="text-xs text-slate-500 mt-1">{VIEW_TITLES[activeView].subtitle}</p>
          </div>

          {activeView === 'overview' && <OverviewView onUnauthorized={handleUnauthorized} />}
          {activeView === 'orders' && <OrdersView onUnauthorized={handleUnauthorized} />}
          {activeView === 'products' && <ProductsView onUnauthorized={handleUnauthorized} />}
          {activeView === 'clients' && <ClientsView onUnauthorized={handleUnauthorized} />}
          {activeView === 'pages' && <LandingPagesView onUnauthorized={handleUnauthorized} />}
          {activeView === 'leads' && <LeadsView onUnauthorized={handleUnauthorized} />}
          {activeView === 'campaigns' && <CampaignsView onUnauthorized={handleUnauthorized} />}
          {activeView === 'help' && <HelpRequestsView onUnauthorized={handleUnauthorized} />}
        </div>
      </main>
    </div>
  );
}
