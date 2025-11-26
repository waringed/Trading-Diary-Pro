import React, { useState } from 'react';
import { PeriodSummary } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';
import { Card } from './ui/Card';

interface SummariesProps {
  weekly: PeriodSummary[];
  monthly: PeriodSummary[];
  quarterly: PeriodSummary[];
  yearly: PeriodSummary[];
}

export const Summaries: React.FC<SummariesProps> = ({ weekly, monthly, quarterly, yearly }) => {
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'quarter' | 'year'>('week');

  const tabs = [
    { id: 'week', label: 'Semanal', data: weekly },
    { id: 'month', label: 'Mensual', data: monthly },
    { id: 'quarter', label: 'Trimestral', data: quarterly },
    { id: 'year', label: 'Anual', data: yearly },
  ] as const;

  const currentData = tabs.find(t => t.id === activeTab)?.data || [];

  return (
    <Card className="h-full">
        <div className="flex border-b border-slate-700 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                activeTab === tab.id ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {currentData.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">No hay datos suficientes.</p>
          ) : (
            currentData.map((item) => (
              <div key={item.periodId} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg border border-slate-800">
                <div>
                  <div className="font-bold text-slate-200">{item.periodId}</div>
                  <div className="text-xs text-slate-500">{item.tradeCount} días operados</div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${item.plDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(item.plDollar)}
                  </div>
                  <div className={`text-xs ${item.plPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatPercent(item.plPercent)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
    </Card>
  );
};
