import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Pencil, Trash2, Layers, EyeOff, ExternalLink } from 'lucide-react';
import { adminFetch, AdminUnauthorizedError } from '../lib/api';
import { AdminCollection } from '../types';
import { Panel } from './Panel';
import { CollectionEditorModal } from './CollectionEditorModal';

interface CollectionsViewProps {
  onUnauthorized: () => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({ onUnauthorized }) => {
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<AdminCollection | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await adminFetch<AdminCollection[]>('/api/admin/collections');
      setCollections(data);
    } catch (err) {
      if (err instanceof AdminUnauthorizedError) onUnauthorized();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (c: AdminCollection) => {
    if (!window.confirm(`Delete "${c.label}"? Its products stay in the catalogue, but the landing page will stop working.`)) return;
    setDeletingId(c.id);
    try {
      await adminFetch(`/api/admin/collections/${c.id}`, { method: 'DELETE' });
      setCollections((prev) => prev.filter((x) => x.id !== c.id));
    } catch (err) {
      if (err instanceof AdminUnauthorizedError) onUnauthorized();
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading collections...</span>
      </div>
    );
  }

  return (
    <>
      <Panel
        title="Landing Page Collections"
        subtitle={`${collections.length} collection${collections.length === 1 ? '' : 's'}`}
        action={
          <button onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B24BF3] hover:bg-[#9f35e3] text-white text-xs font-bold cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Add Collection
          </button>
        }
      >
        {collections.length === 0 ? (
          <div className="py-12 text-center">
            <Layers className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No collections yet.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {collections.map((c) => (
              <div key={c.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-white">{c.label}</p>
                    {c.isActive ? (
                      <span className="text-emerald-400 text-[10px] font-bold">Live</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 text-[10px] font-bold">
                        <EyeOff className="w-3 h-3" /> Hidden
                      </span>
                    )}
                  </div>
                  <a href={`/collections/${c.routeSlug}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-[#B24BF3] mt-0.5">
                    /collections/{c.routeSlug}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setEditing(c)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(c)} disabled={deletingId === c.id}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer disabled:opacity-50">
                    {deletingId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {(editing || isCreating) && (
        <CollectionEditorModal
          collection={editing}
          onClose={() => { setEditing(null); setIsCreating(false); }}
          onSaved={load}
          onUnauthorized={onUnauthorized}
        />
      )}
    </>
  );
};
