
import React from 'react';
import { GlobalStats } from '../types';
import { formatCurrency } from '../utils/calculations';

interface CapitalSummaryProps {
  stats: GlobalStats;
}

export const CapitalSummary: React.FC<CapitalSummaryProps> = ({ stats }) => {
  const totalDays = stats.winningDays + stats.losingDays;

  // Helper component for small metrics in this specific bar
  const MiniMetric = ({ label, value, colorClass = "text-slate-200" }: { label: string, value: string | number, colorClass?: string }) => (
    <div className="flex flex-col items-center">
        <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
        <p className={`font-semibold text-lg md:text-xl leading-none ${colorClass}`}>{value}</p>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 relative overflow-hidden shadow-lg">
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-8 mt-2">
            
            {/* Left Side: Current Capital (Main) */}
            <div className="text-center lg:text-left flex-shrink-0 w-full lg:w-auto">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Capital Actual</p>
                <h2 className="text-4xl md:text-[46px] font-bold text-white mb-0 leading-none tracking-tight shadow-black drop-shadow-lg">
                    {formatCurrency(stats.currentCapital)}
                </h2>
            </div>
            
            {/* Right Side: Metrics Row - Responsive Wrap */}
            <div className="flex flex-wrap justify-center lg:justify-end items-center gap-x-4 md:gap-x-5 gap-y-4 flex-1">
                
                {/* Start Date Block */}
                <div className="flex flex-col items-center">
                    <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-1">Fecha Inicio</p>
                    <p className="font-semibold text-lg md:text-xl text-slate-200 leading-none whitespace-nowrap">
                        {stats.startDate !== '-' ? stats.startDate : 'N/A'}
                    </p>
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block w-px h-10 bg-slate-700"></div>

                {/* Time Metrics Group - Reduced gap */}
                <div className="flex gap-3 md:gap-5">
                    <MiniMetric label="Días" value={totalDays} colorClass="text-blue-300" />
                    <MiniMetric label="Semanas" value={stats.durationWeeks.toFixed(1)} />
                    <MiniMetric label="Meses" value={stats.durationMonths.toFixed(1)} />
                    <MiniMetric label="Años" value={stats.durationYears.toFixed(1)} />
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block w-px h-10 bg-slate-700"></div>

                {/* Financial Metrics Group (Reordered: Initial -> P/L) - Reduced gap */}
                <div className="flex gap-4 md:gap-5">
                     <div className="flex flex-col items-center">
                        <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-1">Cap. Inicial</p>
                        <p className="font-semibold text-lg md:text-xl text-slate-300 leading-none">
                            {formatCurrency(stats.totalInitialCapital)}
                        </p>
                    </div>

                     <div className="flex flex-col items-center">
                        <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-1">P/L Histórico</p>
                        <p className={`font-semibold text-lg md:text-xl leading-none ${stats.totalPLDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {stats.totalPLDollar >= 0 ? '+' : ''}{formatCurrency(stats.totalPLDollar)}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};
