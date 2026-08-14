import React, { useEffect, useState } from 'react';
import { Loader2, Mail, Crown } from 'lucide-react';
import { adminFetch, AdminUnauthorizedError } from '../lib/api';
import { AdminClient, STORE_LABELS } from '../types';
import { Panel } from './Panel';

interface ClientsViewProps {
  onUnauthorized: () => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({ onUnauthorized }) => {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await adminFetch<AdminClient[]>('/api/clients');
        setClients(data);
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
        <span className="text-sm">Loading clients...</span>
      </div>
    );
  }

  const withEmail = clients.filter((c) => c.email).length;

  return (
    <Panel
      title="Clients"
      subtitle={`${clients.length} unique clients · ${withEmail} with email on file`}
    >
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-500 border-b border-white/10">
              <th className="pb-2.5 font-bold pr-3">Client</th>
              <th className="pb-2.5 font-bold pr-3">Contact</th>
              <th className="pb-2.5 font-bold pr-3">Collections Shopped</th>
              <th className="pb-2.5 font-bold pr-3">Orders</th>
              <th className="pb-2.5 font-bold pr-3">Total Spent</th>
              <th className="pb-2.5 font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.phone} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 pr-3">
                  <p className="font-bold text-white">{c.name}</p>
                  <p className="text-slate-500 text-[10px]">{c.city}</p>
                </td>
                <td className="py-3 pr-3">
                  <p className="text-slate-300">{c.phone}</p>
                  {c.email ? (
                    <p className="text-slate-500 text-[10px] flex items-center gap-1">
                      <Mail className="w-2.5 h-2.5" /> {c.email}
                    </p>
                  ) : (
                    <p className="text-slate-600 text-[10px] italic">No email on file</p>
                  )}
                </td>
                <td className="py-3 pr-3 text-slate-400">
                  {c.stores.map((s) => STORE_LABELS[s] || s).join(', ')}
                </td>
                <td className="py-3 pr-3 font-bold text-slate-200">{c.ordersCount}</td>
                <td className="py-3 pr-3 font-black text-[#B24BF3]">${c.totalSpentUSD.toLocaleString()}</td>
                <td className="py-3">
                  {c.status === 'VIP Buyer' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                      <Crown className="w-3 h-3" /> VIP
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10 font-semibold">
                      Active
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && (
          <p className="text-xs text-slate-500 py-8 text-center">No clients yet.</p>
        )}
      </div>
    </Panel>
  );
};
