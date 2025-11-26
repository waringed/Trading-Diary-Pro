import React from 'react';
import { GlobalStats } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';
import { Card } from './ui/Card';

interface StatsPanelProps {
  stats: GlobalStats;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  const StatRow = ({ label, valDollar, valPerc, isPositive }: { label: string, valDollar: number, valPerc: number, isPositive?: boolean }) => {
    // If isPositive is not provided, derive it from value
    const positive = isPositive !== undefined ? isPositive : valDollar >= 0;
    const colorClass = positive ? 'text-emerald-400' : 'text-rose-400';
    
    return (
      <div className="flex justify-between items-center py-2 border-b border-slate-700/50 last:border-0">
        <span className="text-slate-400 text-base">{label}</span>
        <div className="text-right">
          <span className={`block text-xl font-semibold ${colorClass}`}>
            {formatCurrency(valDollar)}
          </span>
          <span className="block text-base text-slate-500">{formatPercent(valPerc)}</span>
        </div>
      </div>
    );
  };

  const hasData = stats.winningDays + stats.losingDays > 0;

  return (
    <Card title="Análisis Detallado">
        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            
            {/* Col 1: Performance & Streaks */}
            <div className="space-y-4">
                {/* Effectiveness Section */}
                <div className="space-y-2 bg-slate-900/30 p-4 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-end">
                    <h4 className="text-base font-semibold text-slate-200">Efectividad Global</h4>
                    <span className="text-3xl font-bold text-blue-400">{formatPercent(stats.winRate)}</span>
                  </div>
                  
                  {hasData ? (
                     <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-500" 
                          style={{ width: `${stats.winRate}%` }}
                        />
                        <div 
                          className="h-full bg-rose-500 transition-all duration-500" 
                          style={{ width: `${100 - stats.winRate}%` }}
                        />
                     </div>
                  ) : (
                     <div className="h-3 bg-slate-800 rounded-full w-full"></div>
                  )}
                  
                  <div className="flex justify-between text-sm text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {stats.winningDays} ganados
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        {stats.losingDays} perdidos
                    </span>
                  </div>
                </div>

                {/* Streaks Section */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-3 flex flex-col items-center justify-center shadow-sm">
                        <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">Racha Ganadora</span>
                        <span className="text-3xl font-bold text-emerald-100">{stats.maxConsecutiveWins} <span className="text-sm font-normal text-emerald-400/60">días</span></span>
                    </div>
                    <div className="bg-rose-900/10 border border-rose-500/20 rounded-lg p-3 flex flex-col items-center justify-center shadow-sm">
                        <span className="text-xs text-rose-400 font-bold uppercase tracking-wider mb-1">Racha Perdedora</span>
                        <span className="text-3xl font-bold text-rose-100">{stats.maxConsecutiveLosses} <span className="text-sm font-normal text-rose-400/60">días</span></span>
                    </div>
                </div>

                {/* Esperanza Matemática con Tooltip */}
                <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-800 flex justify-between items-center relative">
                    <div className="group flex items-center gap-1 cursor-help relative z-20">
                        <span className="text-slate-400 text-base border-b border-dotted border-slate-500">Esperanza Matemática</span>
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        
                        {/* Tooltip Popup */}
                        <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-800 border border-slate-600 rounded-lg shadow-xl text-xs text-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                            <p className="font-bold mb-1 text-blue-400">Promedio Neto Real</p>
                            <p className="leading-relaxed">Calcula cuánto ganas o pierdes estadísticamente cada día que operas, combinando tu efectividad con el tamaño de tus ganancias y pérdidas.</p>
                            <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-600"></div>
                        </div>
                    </div>

                    <span className={`text-2xl font-semibold ${stats.avgGeneralDollar >= 0 ? 'text-blue-400' : 'text-slate-400'}`}>
                        {formatCurrency(stats.avgGeneralDollar)}
                    </span>
                </div>
            </div>

            {/* Col 2: Daily & Weekly Averages */}
            <div className="space-y-4">
                <div>
                   <h4 className="text-base font-semibold text-slate-200 mb-2 border-b border-slate-700 pb-2">Promedios Diarios</h4>
                   <StatRow label="Ganancia Promedio" valDollar={stats.avgWinDailyDollar} valPerc={stats.avgWinDailyPercent} isPositive={true} />
                   <StatRow label="Pérdida Promedio" valDollar={stats.avgLossDailyDollar} valPerc={stats.avgLossDailyPercent} isPositive={false} />
                </div>

                <div>
                   <h4 className="text-base font-semibold text-slate-200 mb-2 border-b border-slate-700 pb-2">Promedios Semanales</h4>
                   <StatRow label="Ganancia Semanal" valDollar={stats.avgWinWeeklyDollar} valPerc={stats.avgWinWeeklyPercent} isPositive={true} />
                   <StatRow label="Pérdida Semanal" valDollar={stats.avgLossWeeklyDollar} valPerc={stats.avgLossWeeklyPercent} isPositive={false} />
                </div>
            </div>

            {/* Col 3: Monthly & Extremes */}
            <div className="space-y-4">
                 <div>
                   <h4 className="text-base font-semibold text-slate-200 mb-2 border-b border-slate-700 pb-2">Promedios Mensuales</h4>
                   <StatRow label="Ganancia Mensual" valDollar={stats.avgWinMonthlyDollar} valPerc={stats.avgWinMonthlyPercent} isPositive={true} />
                   <StatRow label="Pérdida Mensual" valDollar={stats.avgLossMonthlyDollar} valPerc={stats.avgLossMonthlyPercent} isPositive={false} />
                </div>

                <div>
                   <h4 className="text-base font-semibold text-slate-200 mb-2 border-b border-slate-700 pb-2">Récords Diarios</h4>
                   <StatRow label="Mejor Día" valDollar={stats.maxWinDailyDollar} valPerc={stats.maxWinDailyPercent} isPositive={true} />
                   <StatRow label="Peor Día" valDollar={stats.maxLossDailyDollar} valPerc={stats.maxLossDailyPercent} isPositive={false} />
                </div>
            </div>

        </div>
    </Card>
  );
};