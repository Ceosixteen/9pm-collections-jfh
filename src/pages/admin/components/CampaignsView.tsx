import React, { useEffect, useState } from 'react';
import { Loader2, Megaphone, Send, CheckCircle2 } from 'lucide-react';
import { adminFetch, AdminUnauthorizedError } from '../lib/api';
import { AdminCampaign } from '../types';
import { Panel } from './Panel';

interface CampaignsViewProps {
  onUnauthorized: () => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({ onUnauthorized }) => {
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentJustNow, setSentJustNow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCampaigns = async () => {
    try {
      const data = await adminFetch<AdminCampaign[]>('/api/admin/campaigns');
      setCampaigns(data);
    } catch (err) {
      if (err instanceof AdminUnauthorizedError) onUnauthorized();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim() || isSending) return;
    setIsSending(true);
    setError(null);
    setSentJustNow(false);
    try {
      await adminFetch('/api/admin/campaigns', {
        method: 'POST',
        body: JSON.stringify({ title: title.trim(), message: message.trim() }),
      });
      setTitle('');
      setMessage('');
      setSentJustNow(true);
      await loadCampaigns();
      setTimeout(() => setSentJustNow(false), 4000);
    } catch (err) {
      if (err instanceof AdminUnauthorizedError) {
        onUnauthorized();
      } else {
        setError('Could not send this campaign. Please try again.');
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-5">
      <Panel
        title="Send a Campaign"
        subtitle="Broadcasts instantly to every signed-in customer's account notifications."
      >
        <form onSubmit={handleSend} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekend Flash Sale — 20% Off Everything!"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#B24BF3]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. This weekend only, get 20% off every collection. Order before Sunday midnight!"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#B24BF3] resize-none"
            />
          </div>
          {error && <p className="text-[11px] text-red-400">{error}</p>}
          {sentJustNow && (
            <p className="text-[11px] text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Campaign sent to all members.
            </p>
          )}
          <button
            type="submit"
            disabled={isSending || !title.trim() || !message.trim()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#B24BF3] hover:bg-[#9f35e3] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>{isSending ? 'Sending...' : 'Send to All Members'}</span>
          </button>
        </form>
      </Panel>

      <Panel title="Campaign History" subtitle={`${campaigns.length} campaigns sent`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading campaigns...</span>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="py-12 text-center">
            <Megaphone className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No campaigns sent yet.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-bold text-white">{c.title}</p>
                  <p className="text-[10px] text-slate-600 shrink-0">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{c.message}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
};
