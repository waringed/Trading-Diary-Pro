
import React, { useState } from 'react';
import { CalculatedDay } from '../types';
import { formatCurrency } from '../utils/calculations';
import { Card } from './ui/Card';

interface TradingCalendarProps {
  data: CalculatedDay[];
}

export const TradingCalendar: React.FC<TradingCalendarProps> = ({ data }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helpers for navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const resetToToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get number of days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Get starting day of week (0=Sun, 1=Mon, etc.)
  let firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  // Adjust so 0 is Monday, 6 is Sunday
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // Month Names
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // Weekday Headers (Mon - Sun)
  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  // Create grid cells
  const blanks = Array(firstDayOfWeek).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalSlots = [...blanks, ...days];

  // Helper to shorten currency for small pill
  const formatCompact = (val: number) => {
    if (val >= 1000) return `${(val/1000).toFixed(1)}k`;
    return Math.round(val).toString();
  }

  return (
    <Card 
        title="Calendario de Rendimiento" 
        action={
            <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1">
                <button onClick={prevMonth} className="p-1 hover:text-white text-slate-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="text-sm font-bold text-slate-200 min-w-[100px] text-center select-none">
                    {monthNames[month]} {year}
                </span>
                <button onClick={nextMonth} className="p-1 hover:text-white text-slate-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
                <button onClick={resetToToday} className="text-xs text-blue-400 hover:text-blue-300 ml-2 font-medium px-2">
                    Hoy
                </button>
            </div>
        }
    >
      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px]">
            {/* Header Grid */}
            <div className="grid grid-cols-7 mb-2">
                {weekDays.map(d => (
                    <div key={d} className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider py-2">
                        {d}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
                {totalSlots.map((dayNum, index) => {
                    if (dayNum === null) {
                        return <div key={`blank-${index}`} className="h-28 bg-transparent"></div>;
                    }

                    // Construct date string YYYY-MM-DD to find match
                    const currentDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    const entry = data.find(d => d.date === currentDayStr);

                    let bgColor = "bg-slate-900/50 border-slate-700/50";
                    let textColor = "text-slate-500";
                    let plText = null;

                    if (entry) {
                        if (entry.plDailyDollar > 0) {
                            bgColor = "bg-emerald-900/30 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]";
                            textColor = "text-emerald-100";
                            plText = (
                                <span className="text-emerald-400 font-bold text-sm">
                                    +{Math.round(entry.plDailyDollar)}
                                </span>
                            );
                        } else if (entry.plDailyDollar < 0) {
                            bgColor = "bg-rose-900/30 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.1)]";
                            textColor = "text-rose-100";
                            plText = (
                                <span className="text-rose-400 font-bold text-sm">
                                    {Math.round(entry.plDailyDollar)}
                                </span>
                            );
                        } else {
                            // Break even
                            bgColor = "bg-slate-700/50 border-slate-600";
                            textColor = "text-slate-200";
                            plText = <span className="text-slate-400 text-sm">0</span>;
                        }
                    }

                    return (
                        <div 
                            key={currentDayStr} 
                            className={`h-28 border rounded-lg p-1.5 flex flex-col justify-between relative transition-all hover:scale-[1.02] ${bgColor}`}
                            title={entry ? `P/L: ${formatCurrency(entry.plDailyDollar)}` : 'Sin operaciones'}
                        >
                            {/* Top Row: Note Icon, Cash Flow Badges, Day Number */}
                            <div className="flex justify-between items-start w-full">
                                {/* Note Icon */}
                                <span className="text-[10px] w-4 flex-shrink-0" title="Ver notas en el diario">
                                    {entry?.notes ? '📝' : ''}
                                </span>

                                {/* CASH FLOW BADGES (Centered in top row) */}
                                <div className="flex gap-0.5 items-center justify-center flex-1 mx-1">
                                    {entry && entry.deposit > 0 && (
                                        <span className="text-[8px] bg-emerald-900/90 text-emerald-300 px-1 rounded-full border border-emerald-500/30 leading-tight">
                                            +{formatCompact(entry.deposit)}
                                        </span>
                                    )}
                                    {entry && entry.withdrawal > 0 && (
                                        <span className="text-[8px] bg-rose-900/90 text-rose-300 px-1 rounded-full border border-rose-500/30 leading-tight">
                                            -{formatCompact(entry.withdrawal)}
                                        </span>
                                    )}
                                </div>
                                
                                {/* Day Number */}
                                <span className={`text-xs font-medium w-4 text-right flex-shrink-0 ${textColor}`}>
                                    {dayNum}
                                </span>
                            </div>
                            
                            {entry ? (
                                <>
                                    {/* Middle: P/L Dollar and Percent (Centered in available space) */}
                                    <div className="flex flex-col items-center justify-center flex-1">
                                        {plText}
                                        <span className={`text-[10px] font-medium ${entry.plDailyPercent >= 0 ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
                                            {entry.plDailyPercent > 0 ? '+' : ''}{entry.plDailyPercent.toFixed(2)}%
                                        </span>
                                    </div>

                                    {/* Bottom: Final Capital & Ops */}
                                    <div className="mt-auto pt-1 border-t border-slate-700/30 w-full flex justify-between items-end">
                                         <div className="flex flex-col items-start">
                                             <span className="text-[8px] text-slate-500 block uppercase tracking-tighter leading-none mb-0.5">Saldo</span>
                                             <span className="text-[9px] text-slate-300 font-mono leading-none">
                                                ${Math.round(entry.finalCapital).toLocaleString()}
                                             </span>
                                         </div>
                                         <div className="flex flex-col items-end">
                                             <span className="text-[8px] text-slate-500 block uppercase tracking-tighter leading-none mb-0.5">Ops</span>
                                             <span className="text-[9px] text-slate-300 font-mono leading-none text-blue-300">
                                                {entry.tradeCount}
                                             </span>
                                         </div>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </Card>
  );
};
