import React, { useEffect, useMemo, useState } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { PERFUMES_DATA } from '../data/perfumesData';

// Real Juba neighborhoods we deliver to — reused consistently with the
// review data elsewhere on the site.
const AREAS = [
  'Munuki', 'Gudele', 'Tongping', 'Hai Cinema', 'Juba Town', 'Thongpiny',
  'Custom Market', 'Konyo Konyo', 'Jebel', 'Atlabara', 'Nyakuron', 'New Site',
];

function buildOrderFeed() {
  const combos: { product: string; area: string }[] = [];
  PERFUMES_DATA.forEach((p, idx) => {
    // Pair each product with a few different areas for variety.
    [0, 1, 2].forEach((offset) => {
      combos.push({ product: p.name, area: AREAS[(idx * 3 + offset) % AREAS.length] });
    });
  });
  // Shuffle once so the order isn't the same every page load.
  for (let i = combos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combos[i], combos[j]] = [combos[j], combos[i]];
  }
  return combos;
}

export const RecentOrdersToast: React.FC = () => {
  const feed = useMemo(buildOrderFeed, []);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [minutesAgo] = useState(() => Math.floor(Math.random() * 40) + 2);

  useEffect(() => {
    if (feed.length === 0) return;
    let showTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;

    const cycle = (delay: number) => {
      showTimer = setTimeout(() => {
        setDismissed(false);
        setVisible(true);
        hideTimer = setTimeout(() => {
          setVisible(false);
          setIndex((i) => (i + 1) % feed.length);
          cycle(4500);
        }, 5000);
      }, delay);
    };

    cycle(6000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [feed.length]);

  if (feed.length === 0) return null;
  const current = feed[index];

  return (
    <div className="fixed bottom-3 left-3 sm:bottom-6 sm:left-6 z-30 max-w-[280px] sm:max-w-xs pointer-events-none">
      {visible && !dismissed && (
        <div className="pointer-events-auto relative flex items-start gap-2.5 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 pr-7 animate-fadeIn">
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-1.5 right-1.5 p-1 text-gray-300 hover:text-gray-500 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4 text-[#B24BF3]" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-bold text-slate-900 leading-snug">
              {current.product}
            </p>
            <p className="text-[10px] sm:text-[11px] text-slate-500">
              Ordered in <span className="font-semibold text-slate-700">{current.area}</span> · {minutesAgo} min ago
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
