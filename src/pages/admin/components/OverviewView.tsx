import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Users, Eye, Loader2 } from 'lucide-react';
import { adminFetch, AdminUnauthorizedError } from '../lib/api';
import { AdminOrder, AdminClient, SalesByPageResponse, PageviewsSummaryResponse } from '../types';
import { StatCard } from './StatCard';
import { Panel } from './Panel';
import { BarChart } from './BarChart';

interface OverviewViewProps {
  onUnauthorized: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onUnauthorized }) => {
  const [sales, setSales] = useState<SalesByPageResponse | null>(null);
  const [pageviews, setPageviews] = useState<PageviewsSummaryResponse | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [salesData, viewsData, ordersData, clientsData] = await Promise.all([
          adminFetch<SalesByPageResponse>('/api/admin/sales-by-page'),
          adminFetch<PageviewsSummaryResponse>('/api/admin/pageviews-summary'),
          adminFetch<AdminOrder[]>('/api/orders'),
          adminFetch<AdminClient[]>('/api/clients'),
        ]);
        setSales(salesData);
        setPageviews(viewsData);
        setOrders(ordersData);
        setClients(clientsData);
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
        <span className="text-sm">Loading dashboard...</span>
      </div>
    );
  }

  const vipCount = clients.filter((c) => c.status === 'VIP Buyer').length;
  const recentOrders = orders.slice(0, 6);

  const revenueRows: { label: string; value: number; displayValue: string }[] = sales
    ? (Object.values(sales.byStore) as SalesByPageResponse['byStore'][string][])
        .sort((a, b) => b.revenueUSD - a.revenueUSD)
        .map((s) => ({ label: s.label, value: s.revenueUSD, displayValue: `$${s.revenueUSD.toLocaleString()}` }))
    : [];

  const viewsRows: { label: string; value: number; displayValue: string }[] = pageviews
    ? (Object.entries(pageviews.byStore) as [string, number][])
        .sort((a, b) => b[1] - a[1])
        .map(([slug, count]) => ({ label: slug, value: count, displayValue: `${count.toLocaleString()} views` }))
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`$${(sales?.totalRevenueUSD || 0).toLocaleString()}`}
          accent="emerald"
        />
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={(sales?.totalOrders || 0).toLocaleString()}
          accent="purple"
        />
        <StatCard
          icon={Users}
          label="Clients"
          value={clients.length.toLocaleString()}
          subtext={`${vipCount} VIP buyer${vipCount === 1 ? '' : 's'}`}
          accent="amber"
        />
        <StatCard
          icon={Eye}
          label="Page Views"
          value={(pageviews?.total || 0).toLocaleString()}
          subtext="Since tracking went live"
          accent="sky"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Revenue by Landing Page" subtitle="All-time, USD">
          <BarChart rows={revenueRows} />
        </Panel>
        <Panel title="Traffic by Landing Page" subtitle="Page views since tracking went live">
          <BarChart rows={viewsRows} barColor="#38bdf8" />
        </Panel>
      </div>

      <Panel title="Recent Orders" subtitle="Latest 6 across all collections">
        <div className="space-y-2">
          {recentOrders.length === 0 && (
            <p className="text-xs text-slate-500 py-4 text-center">No orders yet.</p>
          )}
          {recentOrders.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {o.customerName} <span className="text-slate-500 font-normal">· #{o.id}</span>
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {o.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}
                </p>
              </div>
              <span className="text-xs font-black text-[#B24BF3] shrink-0">${o.totalUSD}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};
