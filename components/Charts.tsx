import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { CalculatedDay } from '../types';
import { Card } from './ui/Card';
import { formatCurrency } from '../utils/calculations';

interface ChartsProps {
  data: CalculatedDay[];
}

type ViewMode = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export const Charts: React.FC<ChartsProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('daily');

  // filter and aggregate data based on view mode
  const chartData = useMemo(() => {
    // 1. Sort chronologically (Oldest -> Newest)
    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
    
    if (viewMode === 'daily') return sorted;

    // 2. Group by period and take the LAST entry of each group (Closing Capital)
    const grouped = new Map<string, CalculatedDay>();
    
    sorted.forEach(day => {
        let key = '';
        switch (viewMode) {
            case 'weekly': key = day.weekId; break;
            case 'monthly': key = day.monthId; break;
            case 'quarterly': key = day.quarterId; break;
            case 'yearly': key = day.yearId; break;
        }
        // Map.set always updates the value for the key. 
        // Since we are iterating chronologically, the last one set is the end of the period.
        grouped.set(key, day);
    });

    return Array.from(grouped.values());
  }, [data, viewMode]);

  const tabs: { id: ViewMode; label: string }[] = [
    { id: 'daily', label: 'Diario' },
    { id: 'weekly', label: 'Semanal' },
    { id: 'monthly', label: 'Mensual' },
    { id: 'quarterly', label: 'Trim.' },
    { id: 'yearly', label: 'Anual' },
  ];

  const renderTabs = (
    <div className="flex bg-slate-900 rounded-lg p-1">
        {tabs.map(tab => (
            <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                viewMode === tab.id 
                ? 'bg-slate-700 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            >
            {tab.label}
            </button>
        ))}
    </div>
  );

  if (chartData.length < 2 && viewMode === 'daily') {
    return (
        <Card title="Evolución del Capital" action={renderTabs} className="flex items-center justify-center min-h-[200px]">
            <p className="text-slate-500 italic p-6">Registra al menos 2 días para ver el gráfico.</p>
        </Card>
    )
  }

  // Formatting X Axis based on view mode
  const formatXAxis = (val: string) => {
    // val is actually the full date string of the entry (YYYY-MM-DD) because we are using CalculatedDay objects
    if (viewMode === 'daily') return val.slice(5); // MM-DD
    if (viewMode === 'weekly') return val.slice(5); // Show date of Friday (end of week)
    if (viewMode === 'monthly') return val.slice(0, 7); // YYYY-MM
    if (viewMode === 'quarterly') return val.slice(0, 7); // Show Month of quarter end
    if (viewMode === 'yearly') return val.slice(0, 4); // YYYY
    return val;
  };

  return (
    <Card title="Evolución del Capital" action={renderTabs}>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
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
            <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                itemStyle={{ color: '#60a5fa' }}
                formatter={(value: number) => [formatCurrency(value), 'Capital Final']}
                labelFormatter={(label) => {
                    // Find the data point to show context (like Week Label) if needed
                    const item = chartData.find(d => d.date === label);
                    if (viewMode === 'weekly' && item) return item.weekId;
                    return label;
                }}
                labelStyle={{ color: '#94a3b8' }}
            />
            <Area 
                type="monotone" 
                dataKey="finalCapital" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                strokeWidth={2}
                animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};