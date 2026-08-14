import React from 'react';

interface BarChartRow {
  label: string;
  value: number;
  displayValue: string;
}

interface BarChartProps {
  rows: BarChartRow[];
  barColor?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ rows, barColor = '#B24BF3' }) => {
  const max = Math.max(1, ...rows.map((r) => r.value));

  if (rows.length === 0) {
    return <p className="text-xs text-slate-500 py-6 text-center">No data yet.</p>;
  }

  return (
    <div className="space-y-3.5">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-slate-200">{row.label}</span>
            <span className="font-semibold text-slate-400">{row.displayValue}</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(4, (row.value / max) * 100)}%`,
                background: `linear-gradient(90deg, ${barColor}, ${barColor}99)`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
