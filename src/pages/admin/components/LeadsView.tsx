import React, { useEffect, useState } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { adminFetch, AdminUnauthorizedError } from '../lib/api';
import { AdminLead, STORE_LABELS } from '../types';
import { Panel } from './Panel';

interface LeadsViewProps {
  onUnauthorized: () => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({ onUnauthorized }) => {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await adminFetch<AdminLead[]>('/api/admin/leads');
        setLeads(data);
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
        <span className="text-sm">Loading email leads...</span>
      </div>
    );
  }

  return (
    <Panel title="Email Leads" subtitle={`${leads.length} captured from homepage signups`}>
      {leads.length === 0 ? (
        <div className="py-12 text-center">
          <Mail className="w-8 h-8 text-slate-700 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No email signups yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-500 border-b border-white/10">
                <th className="pb-2.5 font-bold pr-3">Email</th>
                <th className="pb-2.5 font-bold pr-3">Source</th>
                <th className="pb-2.5 font-bold">Captured</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3 pr-3 font-semibold text-slate-200">{l.email}</td>
                  <td className="py-3 pr-3 text-slate-400">
                    {STORE_LABELS[l.storeSlug] || l.source}
                  </td>
                  <td className="py-3 text-slate-500 whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
};
