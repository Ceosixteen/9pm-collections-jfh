import React from 'react';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: 'purple' | 'emerald' | 'amber' | 'sky';
  subtext?: string;
}

const ACCENT_STYLES: Record<string, string> = {
  purple: 'from-[#B24BF3]/20 to-purple-600/5 text-[#B24BF3] border-[#B24BF3]/20',
  emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20',
  amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/20',
  sky: 'from-sky-500/20 to-sky-600/5 text-sky-400 border-sky-500/20',
};

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, accent = 'purple', subtext }) => {
  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 shadow-lg backdrop-blur-xl">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ACCENT_STYLES[accent]} border flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-black text-white leading-none">{value}</p>
      <p className="text-xs text-slate-400 font-semibold mt-1.5">{label}</p>
      {subtext && <p className="text-[10px] text-slate-500 mt-1">{subtext}</p>}
    </div>
  );
};
