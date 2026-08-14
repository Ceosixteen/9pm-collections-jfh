import React from 'react';

interface PanelProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Panel: React.FC<PanelProps> = ({ title, subtitle, action, children, className = '' }) => {
  return (
    <div className={`rounded-2xl bg-white/[0.04] border border-white/10 shadow-lg backdrop-blur-xl overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div>
          <h3 className="text-sm font-black text-white">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};
