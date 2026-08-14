import React, { useEffect, useState } from 'react';
import { Loader2, MessageCircleQuestion, CheckCircle2, XCircle } from 'lucide-react';
import { adminFetch, AdminUnauthorizedError } from '../lib/api';
import { AdminHelpRequest } from '../types';
import { Panel } from './Panel';

interface HelpRequestsViewProps {
  onUnauthorized: () => void;
}

export const HelpRequestsView: React.FC<HelpRequestsViewProps> = ({ onUnauthorized }) => {
  const [requests, setRequests] = useState<AdminHelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await adminFetch<AdminHelpRequest[]>('/api/help-requests');
        setRequests(data);
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
        <span className="text-sm">Loading help requests...</span>
      </div>
    );
  }

  return (
    <Panel title="Customer Help Requests" subtitle={`${requests.length} requests forwarded from Amina`}>
      {requests.length === 0 ? (
        <div className="py-12 text-center">
          <MessageCircleQuestion className="w-8 h-8 text-slate-700 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No customer support requests yet.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {requests.map((r) => (
            <div
              key={r.id}
              className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-white">{r.customerPhone}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{r.customerQuery}</p>
                <p className="text-[10px] text-slate-600 mt-1.5">
                  {new Date(r.createdAt).toLocaleString()}
                </p>
              </div>
              {r.telegramNotified ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-bold shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Notified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-slate-500 text-[10px] font-bold shrink-0">
                  <XCircle className="w-3.5 h-3.5" /> Not sent
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
};
