
import React from 'react';
import { GlobalStats } from '../types';
import { formatCurrency } from '../utils/calculations';

interface CapitalSummaryProps {
  stats: GlobalStats;
}

export const CapitalSummary: React.FC<CapitalSummaryProps> = ({ stats }) => {
  const totalDays = stats.winningDays + stats.losingDays;

  // Helper component for small metrics to ensure exact same sizing
  // UPDATED: Added tooltip support
  const MetricBlock = ({ 
    label, 
    value, 
    colorClass = "text-slate-200", 
    tooltip 
  }: { 
    label: string, 
    value: string | number | React.ReactNode, 
    colorClass?: string,
    tooltip?: string
  }) => (
    <div className="flex flex-col items-center relative group">
        <p className={`text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1 ${tooltip ? 'cursor-help' : ''}`}>
            {label}
            {tooltip && (
                <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
        </p>
        <div className={`font-semibold text-xl text-xl leading-none ${colorClass}`}>{value}</div>
        
        {/* Tooltip Popup */}
        {tooltip && (
            <div className="absolute bottom-full mb-2 w-48 p-2 bg-slate-800 border border-slate-600 rounded shadow-xl text-[10px] normal-case tracking-normal text-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-[100] text-center leading-relaxed">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-600"></div>
            </div>
        )}
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 relative shadow-lg">
        
        {/* Main Content Container - Centered Vertically */}
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-8 h-full">
            
            {/* Left Side: Current Capital (Main) */}
            <div className="text-center lg:text-left flex-shrink-0 w-full lg:w-auto">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Capital Actual</p>
                <h2 className="text-4xl md:text-[46px] font-bold text-white mb-0 leading-none tracking-tight shadow-black drop-shadow-lg">
                    {formatCurrency(stats.currentCapital)}
                </h2>
            </div>
            
            {/* Right Side: Metrics Row - Responsive Wrap */}
            <div className="flex flex-wrap justify-center lg:justify-end items-center gap-x-4 md:gap-x-6 gap-y-4 flex-1">
                
                {/* 1. Financial Metrics Group (NOW FIRST) */}
                <div className="flex gap-4 md:gap-6">
                    <MetricBlock 
                        label="Cap. Inicial" 
                        value={formatCurrency(stats.totalInitialCapital)} 
                        colorClass="text-slate-300"
                    />
                    <MetricBlock 
                        label="P/L Histórico" 
                        value={`${stats.totalPLDollar >= 0 ? '+' : ''}${formatCurrency(stats.totalPLDollar)}`}
                        colorClass={stats.totalPLDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'}
                        tooltip="Ganancia neta generada exclusivamente por trading. (Ajustado por depósitos y retiros)."
                    />
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block w-px h-10 bg-slate-700"></div>

                {/* 2. Start Date Block (NOW MIDDLE) */}
                <MetricBlock 
                    label="Fecha Inicio" 
                    value={<span className="whitespace-nowrap">{stats.startDate !== '-' ? stats.startDate : 'N/A'}</span>}
                />

                {/* Vertical Divider */}
                <div className="hidden md:block w-px h-10 bg-slate-700"></div>

                {/* 3. Time Metrics Group (NOW LAST) */}
                <div className="flex gap-3 md:gap-5">
                    <MetricBlock label="Días" value={totalDays} colorClass="text-blue-300" />
                    <MetricBlock label="Semanas" value={stats.durationWeeks.toFixed(1)} />
                    <MetricBlock label="Meses" value={stats.durationMonths.toFixed(1)} />
                    <MetricBlock label="Años" value={stats.durationYears.toFixed(1)} />
                </div>

            </div>
        </div>
    </div>
  );
};
