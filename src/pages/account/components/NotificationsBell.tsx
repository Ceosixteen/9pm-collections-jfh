import React, { useEffect, useRef, useState } from 'react';
import { Bell, Megaphone, Package, Loader2 } from 'lucide-react';
import { accountFetch, UnauthorizedError } from '../lib/api';
import { CustomerNotification } from '../types';

interface NotificationsBellProps {
  onUnauthorized: () => void;
}

export const NotificationsBell: React.FC<NotificationsBellProps> = ({ onUnauthorized }) => {
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const load = async () => {
    try {
      const data = await accountFetch<CustomerNotification[]>('/api/my-notifications');
      setNotifications(data);
    } catch (err) {
      if (err instanceof UnauthorizedError) onUnauthorized();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close the dropdown on outside click.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleToggle = async () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen && unreadCount > 0) {
      // Optimistically flip everything to read so the badge clears right away.
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      try {
        await accountFetch('/api/my-notifications/mark-all-read', { method: 'POST' });
      } catch (err) {
        if (err instanceof UnauthorizedError) onUnauthorized();
      }
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-all"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#B24BF3] text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-[85vw] max-h-[70vh] overflow-y-auto rounded-2xl bg-white border border-gray-100 shadow-2xl z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-xs font-black text-slate-900">Notifications</h3>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-slate-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Loading...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-10 text-center px-4">
              <Bell className="w-6 h-6 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Nothing here yet. We'll let you know about order updates and offers.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((n) => {
                const Icon = n.type === 'campaign' ? Megaphone : Package;
                return (
                  <div key={n.id} className={`px-4 py-3 ${n.read ? '' : 'bg-purple-50/40'}`}>
                    <div className="flex items-start gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        n.type === 'campaign' ? 'bg-purple-100 text-[#B24BF3]' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900">{n.title}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
