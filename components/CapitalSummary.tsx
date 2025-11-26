import React from 'react';
import { GlobalStats } from '../types';
import { formatCurrency } from '../utils/calculations';

interface CapitalSummaryProps {
  stats: GlobalStats;
}

export const CapitalSummary: React.FC<CapitalSummaryProps> = ({ stats }) => {
  const totalDays = stats.winningDays + stats.losingDays;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 relative overflow-hidden shadow-lg">
        {/* Decorative Background Icon */}
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <svg className="w-48 h-48 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.15-1.46-3.27-3.4h1.96c.1 1.05 1.18 1.91 2.53 1.91 1.35 0 2.53-.86 2.54-1.94-.01-1.22-1.39-1.51-2.67-1.86-1.59-.44-3.79-1.09-3.77-3.53.01-1.81 1.34-2.87 2.87-3.32V4h2.67v1.93c1.71.36 3.09 1.46 3.23 3.4H15.4c-.1-.97-1.07-1.79-2.3-1.79-1.23 0-2.35.82-2.37 1.93.02 1.25 1.48 1.54 2.86 1.88 1.5.38 3.58 1.02 3.56 3.49-.02 1.82-1.5 2.87-2.94 3.15z"/>
        </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:pr-10">
            {/* Left Side: Current Capital (Left) & Days Traded (Right) */}
            <div className="flex-1 w-full flex flex-col sm:flex-row sm:items-center justify-between md:pr-8">
                <div>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Capital Actual</p>
                    <h2 className="text-[42px] font-bold text-white mb-1 leading-none">{formatCurrency(stats.currentCapital)}</h2>
                    <p className="text-slate-500 text-xs">Saldo total de la cuenta</p>
                </div>
                
                <div className="flex flex-col sm:items-end md:items-end mt-4 sm:mt-0">
                        <p className="text-slate-500 text-xs uppercase mb-1 text-right">Días Operados</p>
                        <p className="font-semibold text-2xl text-blue-300 leading-none text-right">{totalDays}</p>
                </div>
            </div>

            {/* Right Side: Historical Metrics (Divided by border) 
                Added md:mr-24 to push this whole block (and the divider) to the left 
            */}
            <div className="flex w-full md:w-auto justify-between md:justify-start gap-12 border-t md:border-t-0 md:border-l border-slate-700/50 pt-4 md:pt-0 md:pl-12 shrink-0 md:mr-24">
                <div>
                    <p className="text-slate-500 text-xs uppercase mb-1">P/L Histórico</p>
                    <p className={`font-semibold text-2xl leading-none ${stats.totalPLDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {stats.totalPLDollar >= 0 ? '+' : ''}{formatCurrency(stats.totalPLDollar)}
                    </p>
                </div>
                <div>
                    <p className="text-slate-500 text-xs uppercase mb-1">Cap. Inicial</p>
                    <p className="font-semibold text-2xl text-slate-300 leading-none">{formatCurrency(stats.totalInitialCapital)}</p>
                </div>
            </div>
        </div>
    </div>
  );
};