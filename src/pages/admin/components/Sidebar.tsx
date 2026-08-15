import React from 'react';
import { LayoutDashboard, ShoppingBag, Users, Layers, MessageCircleQuestion, Mail, Megaphone, LogOut } from 'lucide-react';

export type AdminView = 'overview' | 'orders' | 'clients' | 'pages' | 'help' | 'leads' | 'campaigns';

interface SidebarProps {
  activeView: AdminView;
  onSelectView: (view: AdminView) => void;
  onLogout: () => void;
}

const NAV_ITEMS: { id: AdminView; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'pages', label: 'Landing Pages', icon: Layers },
  { id: 'leads', label: 'Email Leads', icon: Mail },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { id: 'help', label: 'Help Requests', icon: MessageCircleQuestion },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onSelectView, onLogout }) => {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-16 sm:w-56 bg-[#0A0A0F] border-r border-white/10 flex flex-col z-40">
      <div className="flex items-center gap-2.5 px-3 sm:px-5 py-5 border-b border-white/10">
        <img
          src="/images/juba_fashion_hub_logo.jpg"
          alt="Juba Fashion Hub"
          className="h-8 w-8 sm:h-9 sm:w-9 object-cover rounded-lg shrink-0"
          referrerPolicy="no-referrer"
        />
        <div className="hidden sm:block min-w-0">
          <p className="text-xs font-black text-white truncate">Juba Fashion Hub</p>
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Back Office</p>
        </div>
      </div>

      <nav className="flex-1 py-4 px-2 sm:px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center gap-3 px-2.5 sm:px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#B24BF3]/20 to-purple-600/10 text-white border border-[#B24BF3]/30 shadow-inner'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#B24BF3]' : ''}`} />
              <span className="hidden sm:inline truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-2 sm:p-3 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-2.5 sm:px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </div>
    </aside>
  );
};
