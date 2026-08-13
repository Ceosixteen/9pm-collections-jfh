import { Routes, Route } from 'react-router-dom';
import HomeApp from './pages/home/App';
import NineCollectionApp from './pages/nine-collection/App';
import HawasApp from './pages/hawas/App';
import CeraveApp from './pages/cerave/App';
import BadeeAlOudApp from './pages/badee-al-oud/App';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeApp />} />
      <Route path="/collections/9pm" element={<NineCollectionApp />} />
      <Route path="/collections/hawas" element={<HawasApp />} />
      <Route path="/collections/cerave" element={<CeraveApp />} />
      <Route path="/collections/badee-al-oud" element={<BadeeAlOudApp />} />
    </Routes>
  );
}
