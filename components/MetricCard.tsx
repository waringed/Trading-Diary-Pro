import React from 'react';
import { formatCurrency, formatPercent } from '../utils/calculations';

interface MetricCardProps {
  label: string;
  valueDollar: number;
  valuePercent: number;
  subtext?: string;
  highlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, valueDollar, valuePercent, subtext, highlight = true }) => {
  const isPositive = valueDollar >= 0;
  const colorClass = highlight 
    ? (isPositive ? 'text-emerald-400' : 'text-rose-400') 
    : 'text-slate-100';

  return (
    <div className="bg-slate-700/50 rounded-lg p-5 border border-slate-600 flex flex-col justify-between h-full">
      <p className="text-slate-400 text-lg font-medium mb-1">{label}</p>
      
      <div className="flex flex-col gap-0.5">
        <span className={`text-3xl font-bold ${colorClass} tracking-tight`}>
          {formatCurrency(valueDollar)}
        </span>
        <span className={`text-lg font-medium ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {isPositive ? '+' : ''}{formatPercent(valuePercent)}
        </span>
      </div>

      {subtext && <p className="text-base text-slate-500 mt-3">{subtext}</p>}
    </div>
  );
};