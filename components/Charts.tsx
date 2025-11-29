
import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, TooltipProps } from 'recharts';
import { CalculatedDay } from '../types';
import { Card } from './ui/Card';
import { formatCurrency, formatPercent } from '../utils/calculations';

interface ChartsProps {
  data: CalculatedDay[];
}

type ViewMode = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export const Charts: React.FC<ChartsProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [isExpanded, setIsExpanded] = useState(true);

  // filter and aggregate data based on view mode
  const chartData = useMemo(() => {
    // 1. Sort chronologically (Oldest -> Newest)
    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
    
    if (viewMode === 'daily') {
        // Map to include consistent keys for the tooltip
        return sorted.map(d => ({
            ...d,
            chartChangeDollar: d.plDailyDollar,
            chartChangePercent: d.plDailyPercent,
            // Data for tooltip logic (even if not plotted as shapes)
            flowDepositAmount: d.deposit,
            flowWithdrawalAmount: d.withdrawal
        }));
    }

    // 2. Group by period and take the LAST entry of each group (Closing Capital)
    const grouped = new Map<string, CalculatedDay[]>();
    
    sorted.forEach(day => {
        let key = '';
        switch (viewMode) {
            case 'weekly': key = day.weekId; break;
            case 'monthly': key = day.monthId; break;
            case 'quarterly': key = day.quarterId; break;
            case 'yearly': key = day.yearId; break;
        }
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)?.push(day);
    });

    const result: any[] = [];
    
    grouped.forEach((days, key) => {
        // Get last day for final capital status
        const lastDay = days[days.length - 1];
        
        // Sum flows for the period to show in tooltip
        const totalDep = days.reduce((sum, d) => sum + d.deposit, 0);
        const totalWith = days.reduce((sum, d) => sum + d.withdrawal, 0);

        result.push({
            ...lastDay,
            // For Aggregated views, we recalculate PL based on period accumulation
            chartChangeDollar: viewMode === 'weekly' ? lastDay.plWeekToDateDollar : 
                               viewMode === 'monthly' ? lastDay.plMonthToDateDollar : 0, 
                               // Note: Quarterly/Yearly dynamic calculation handled below
            chartChangePercent: viewMode === 'weekly' ? lastDay.plWeekToDatePercent :
                                viewMode === 'monthly' ? lastDay.plMonthToDatePercent : 0,
            
            flowDepositAmount: totalDep,
            flowWithdrawalAmount: totalWith
        });
    });

    // Sort aggregated result
    result.sort((a, b) => a.date.localeCompare(b.date));

    // 3. Post-calc for Quarterly/Yearly changes if needed
    return result.map((item, index) => {
        if (viewMode === 'quarterly' || viewMode === 'yearly') {
             const prevCapital = index > 0 ? result[index - 1].finalCapital : item.initialCapitalTotal;
             const change = item.finalCapital - prevCapital;
             const percent = prevCapital !== 0 ? (change / prevCapital) * 100 : 0;
             return { ...item, chartChangeDollar: change, chartChangePercent: percent };
        }
        return item;
    });

  }, [data, viewMode]);

  const tabs: { id: ViewMode; label: string }[] = [
    { id: 'daily', label: 'Diario' },
    { id: 'weekly', label: 'Semanal' },
    { id: 'monthly', label: 'Mensual' },
    { id: 'quarterly', label: 'Trim.' },
    { id: 'yearly', label: 'Anual' },
  ];

  const renderHeaderAction = (
    <div className="flex items-center gap-2">
        {/* View Mode Tabs (Only show if expanded) */}
        {isExpanded && (
            <div className="flex bg-slate-900 rounded-lg p-1 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                    key={tab.id}
                    onClick={() => setViewMode(tab.id)}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all whitespace-nowrap ${
                        viewMode === tab.id 
                        ? 'bg-slate-700 text-white shadow' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    >
                    {tab.label}
                    </button>
                ))}
            </div>
        )}

        {/* Toggle Button */}
        <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white transition-colors bg-slate-900 p-1.5 rounded-lg border border-slate-700"
            title={isExpanded ? "Colapsar gráfica" : "Desplegar gráfica"}
        >
            <svg className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
    </div>
  );

  if (chartData.length < 2 && viewMode === 'daily' && isExpanded) {
    return (
        <Card title="Evolución del Capital" action={renderHeaderAction} className="flex items-center justify-center min-h-[200px]">
            <p className="text-slate-500 italic p-6">Registra al menos 2 días para ver el gráfico.</p>
        </Card>
    )
  }

  // Formatting X Axis based on view mode
  const formatXAxis = (val: string) => {
    if (viewMode === 'daily') return val.slice(5); // MM-DD
    if (viewMode === 'weekly') return val.slice(5); 
    if (viewMode === 'monthly') return val.slice(0, 7); // YYYY-MM
    if (viewMode === 'quarterly') return val.slice(0, 7); 
    if (viewMode === 'yearly') return val.slice(0, 4); 
    return val;
  };

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      // Payload[0] is typically the Area chart data
      // We need to find the full data object which contains our custom flow fields
      const data = payload[0].payload;
      
      const changeDollar = data.chartChangeDollar;
      const changePercent = data.chartChangePercent;
      const isPositive = changeDollar >= 0;

      const depositAmount = data.flowDepositAmount;
      const withdrawalAmount = data.flowWithdrawalAmount;

      // Better label formatting for tooltip
      let displayLabel = label;
      if (viewMode === 'weekly') displayLabel = data.weekId; 
      
      return (
        <div className="bg-slate-800 border border-slate-600 p-3 rounded-lg shadow-xl text-sm min-w-[180px]">
          {/* Row 1: Date */}
          <p className="text-slate-400 text-xs mb-2 pb-1 border-b border-slate-700">{displayLabel}</p>
          
          {/* Cash Flow Section (Conditional) */}
          {(depositAmount > 0 || withdrawalAmount > 0) && (
              <div className="mb-2 pb-2 border-b border-slate-700 border-dashed">
                  {depositAmount > 0 && (
                      <div className="flex justify-between items-center text-emerald-400">
                          <span className="text-xs uppercase font-bold">Depósito:</span>
                          <span className="font-bold">+{formatCurrency(depositAmount)}</span>
                      </div>
                  )}
                   {withdrawalAmount > 0 && (
                      <div className="flex justify-between items-center text-rose-400">
                          <span className="text-xs uppercase font-bold">Retiro:</span>
                          <span className="font-bold">-{formatCurrency(withdrawalAmount)}</span>
                      </div>
                  )}
              </div>
          )}
          
          {/* Row 2: Final Capital */}
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-300">Capital Final:</span>
            <span className="text-blue-400 font-bold ml-2">
                {formatCurrency(data.finalCapital)}
            </span>
          </div>

          {/* Row 3: Change $ */}
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-400">Cambio ($):</span>
            <span className={`font-bold ml-2 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? '+' : ''}{formatCurrency(changeDollar)}
            </span>
          </div>

           {/* Row 4: Change % */}
           <div className="flex justify-between items-center">
            <span className="text-slate-400">Cambio (%):</span>
            <span className={`font-bold ml-2 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? '+' : ''}{formatPercent(changePercent)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card title="Evolución del Capital" action={renderHeaderAction}>
      {isExpanded ? (
          <div className="h-[250px] w-full animate-in fade-in slide-in-from-top-4 duration-300">
            <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
                <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    tick={{fontSize: 12}} 
                    tickFormatter={formatXAxis}
                    minTickGap={30}
                />
                <YAxis 
                    stroke="#94a3b8" 
                    tick={{fontSize: 12}}
                    domain={['auto', 'auto']}
                    tickFormatter={(val) => `$${val}`}
                    width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Main Area */}
                <Area 
                    type="monotone" 
                    dataKey="finalCapital" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    strokeWidth={2}
                    animationDuration={500}
                />
            </ComposedChart>
            </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center text-slate-500 text-sm italic py-2 cursor-pointer" onClick={() => setIsExpanded(true)}>
            Haz clic para abrir el panel.
        </div>
      )}
    </Card>
  );
};
