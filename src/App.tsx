import { Routes, Route } from 'react-router-dom';
import HomeApp from './pages/home/App';
import NineCollectionApp from './pages/nine-collection/App';
import HawasApp from './pages/hawas/App';
import CeraveApp from './pages/cerave/App';
import BadeeAlOudApp from './pages/badee-al-oud/App';
import MedixApp from './pages/medix/App';
import AdminApp from './pages/admin/App';
import AccountApp from './pages/account/App';

export default function App() {
  // The admin back office is served from its own subdomain
  // (admin.jubafashionhub.link) rather than a path, so it's routed by
  // hostname here instead of react-router — same build/deployment, just a
  // different entry point once the JS boots.
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isAdminHost = hostname.startsWith('admin.');

  // Local-dev escape hatch: there's no admin.* hostname when running on
  // localhost, so ?admin=1 opens the same back office. Restricted to local
  // hostnames so production routing is completely unchanged.
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
  const wantsAdminPreview =
    isLocalHost &&
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('admin') === '1';

  if (isAdminHost || wantsAdminPreview) {
    return <AdminApp />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomeApp />} />
      <Route path="/collections/9pm" element={<NineCollectionApp />} />
      <Route path="/collections/hawas" element={<HawasApp />} />
      <Route path="/collections/cerave" element={<CeraveApp />} />
      <Route path="/collections/badee-al-oud" element={<BadeeAlOudApp />} />
      <Route path="/collections/medix" element={<MedixApp />} />
      <Route path="/account" element={<AccountApp />} />
    </Routes>
  );
}
