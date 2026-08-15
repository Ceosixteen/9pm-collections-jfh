import { Routes, Route } from 'react-router-dom';
import HomeApp from './pages/home/App';
import NineCollectionApp from './pages/nine-collection/App';
import HawasApp from './pages/hawas/App';
import CeraveApp from './pages/cerave/App';
import BadeeAlOudApp from './pages/badee-al-oud/App';
import AdminApp from './pages/admin/App';
import AccountApp from './pages/account/App';

export default function App() {
  // The admin back office is served from its own subdomain
  // (admin.jubafashionhub.link) rather than a path, so it's routed by
  // hostname here instead of react-router — same build/deployment, just a
  // different entry point once the JS boots.
  const isAdminHost = typeof window !== 'undefined' && window.location.hostname.startsWith('admin.');

  if (isAdminHost) {
    return <AdminApp />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomeApp />} />
      <Route path="/collections/9pm" element={<NineCollectionApp />} />
      <Route path="/collections/hawas" element={<HawasApp />} />
      <Route path="/collections/cerave" element={<CeraveApp />} />
      <Route path="/collections/badee-al-oud" element={<BadeeAlOudApp />} />
      <Route path="/account" element={<AccountApp />} />
    </Routes>
  );
}
