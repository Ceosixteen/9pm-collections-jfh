import React, { useEffect, useState } from 'react';
import { Loader2, ShoppingBag, DollarSign, Eye, TrendingUp } from 'lucide-react';
import { adminFetch, AdminUnauthorizedError } from '../lib/api';
import { SalesByPageResponse, PageviewsSummaryResponse, STORE_LABELS } from '../types';
import { Panel } from './Panel';

interface LandingPagesViewProps {
  onUnauthorized: () => void;
}

export const LandingPagesView: React.FC<LandingPagesViewProps> = ({ onUnauthorized }) => {
  const [sales, setSales] = useState<SalesByPageResponse | null>(null);
  const [pageviews, setPageviews] = useState<PageviewsSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [salesData, viewsData] = await Promise.all([
          adminFetch<SalesByPageResponse>('/api/admin/sales-by-page'),
          adminFetch<PageviewsSummaryResponse>('/api/admin/pageviews-summary'),
        ]);
        setSales(salesData);
        setPageviews(viewsData);
      } catch (err) {
        if (err instanceof AdminUnauthorizedError) onUnauthorized();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [onUnauthorized]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading landing page data...</span>
      </div>
    );
  }

  // Union of every slug that has either sales or traffic data, so a page
  // with views but no orders yet (or vice versa) still shows up.
  const allSlugs = new Set<string>([
    ...Object.keys(sales?.byStore || {}),
    ...Object.keys(pageviews?.byStore || {}),
    'home',
  ]);

  const cards = Array.from(allSlugs).map((slug) => {
    const s = sales?.byStore[slug];
    const views = pageviews?.byStore[slug] || 0;
    const conversion = views > 0 && s ? ((s.orderCount / views) * 100).toFixed(1) : null;
    return {
      slug,
      label: s?.label || STORE_LABELS[slug] || slug,
      revenueUSD: s?.revenueUSD || 0,
      orderCount: s?.orderCount || 0,
      views,
      conversion,
      topProducts: s?.topProducts || [],
    };
  }).sort((a, b) => b.revenueUSD - a.revenueUSD);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {cards.map((c) => (
        <Panel key={c.slug} title={c.label}>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <DollarSign className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-sm font-black text-white">${c.revenueUSD.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500">Revenue</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <ShoppingBag className="w-4 h-4 text-[#B24BF3] mx-auto mb-1" />
              <p className="text-sm font-black text-white">{c.orderCount}</p>
              <p className="text-[10px] text-slate-500">Orders</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <Eye className="w-4 h-4 text-sky-400 mx-auto mb-1" />
              <p className="text-sm font-black text-white">{c.views.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500">Page Views</p>
            </div>
          </div>

          {c.conversion && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span><strong className="text-emerald-400">{c.conversion}%</strong> of views resulted in an order</span>
            </div>
          )}

          {c.topProducts.length > 0 && (
            <div className="pt-3 border-t border-white/5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Top Products</p>
              <div className="space-y-1.5">
                {c.topProducts.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 truncate">{p.productName}</span>
                    <span className="text-slate-500 font-semibold shrink-0 ml-2">{p.quantity} sold</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>
      ))}
    </div>
  );
};
