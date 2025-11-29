
import React, { useState, useEffect } from 'react';
import { GlobalStats, PeriodSummary, CalculatedDay } from '../types';
import { formatCurrency } from '../utils/calculations';
import { Card } from './ui/Card';

interface FundsPanelProps {
  stats: GlobalStats;
  weekly: PeriodSummary[];
  monthly: PeriodSummary[];
  quarterly: PeriodSummary[];
  yearly: PeriodSummary[];
  rawDays: CalculatedDay[];
}

type ViewMode = 'global' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export const FundsPanel: React.FC<FundsPanelProps> = ({ 
  stats, weekly, monthly, quarterly, yearly, rawDays
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('global');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset pagination on view change
  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode]);

  // Determine current dataset and aggregate if needed
  let data: PeriodSummary[] = [];
  let avgLabel = '';

  switch(viewMode) {
      case 'yearly': 
          data = yearly; 
          avgLabel = 'por Año';
          break;
      case 'quarterly': 
          data = quarterly; 
          avgLabel = 'por Trimestre';
          break;
      case 'monthly': 
          data = monthly; 
          avgLabel = 'por Mes';
          break;
      case 'weekly': 
          data = weekly; 
          avgLabel = 'por Semana';
          break;
      case 'daily':
          // Convert Daily entries to PeriodSummary structure for table compatibility
          data = rawDays.map(d => ({
              periodId: d.date,
              label: d.date,
              plDollar: 0, plPercent: 0, winRate: 0, tradeCount: 0, totalOperations: 0, // Dummies
              totalDeposits: d.deposit,
              totalWithdrawals: d.withdrawal
          }));
          avgLabel = 'por Día';
          break;
      default: 
          data = []; 
          avgLabel = 'Total';
          break;
  }

  // Calculate Specific View Totals and Averages
  let viewTotalDeposits = 0;
  let viewTotalWithdrawals = 0;
  
  // Counters for non-zero events (Transaction Count)
  let depositCount = 0;
  let withdrawalCount = 0;

  if (viewMode === 'global') {
      viewTotalDeposits = stats.totalDeposits;
      viewTotalWithdrawals = stats.totalWithdrawals;
  } else {
      // Sum visible periods
      viewTotalDeposits = data.reduce((sum, item) => sum + item.totalDeposits, 0);
      viewTotalWithdrawals = data.reduce((sum, item) => sum + item.totalWithdrawals, 0);
      
      // Count only periods where an actual transaction occurred
      depositCount = data.filter(item => item.totalDeposits > 0).length;
      withdrawalCount = data.filter(item => item.totalWithdrawals > 0).length;
  }
  
  const viewNet = viewTotalDeposits - viewTotalWithdrawals;
  
  // Calculate Average based on active transactions only (avoid dividing by zero)
  const avgDeposit = depositCount > 0 ? viewTotalDeposits / depositCount : 0;
  const avgWithdrawal = withdrawalCount > 0 ? viewTotalWithdrawals / withdrawalCount : 0;

  // Filter out periods with NO cash flow to keep table clean
  const activePeriods = data.filter(d => d.totalDeposits > 0 || d.totalWithdrawals > 0);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(activePeriods.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = activePeriods.slice(indexOfFirstItem, indexOfLastItem);
  
  const startRange = activePeriods.length === 0 ? 0 : indexOfFirstItem + 1;
  const endRange = Math.min(indexOfLastItem, activePeriods.length);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const tabs: { id: ViewMode; label: string }[] = [
    { id: 'global', label: 'Total' },
    { id: 'daily', label: 'Diario' },
    { id: 'weekly', label: 'Semanal' },
    { id: 'monthly', label: 'Mensual' },
    { id: 'quarterly', label: 'Trimestral' },
    { id: 'yearly', label: 'Anual' },
  ];

  const renderTabs = (
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
  );

  return (
    <Card title="Depósitos y Retiros" action={renderTabs}>
        <div className="space-y-6">
            
            {/* KPI ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-4 flex flex-col justify-between">
                    <div>
                        <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">Total Depósitos</p>
                        <p className="text-2xl font-bold text-emerald-100">{formatCurrency(viewTotalDeposits)}</p>
                    </div>
                    {viewMode !== 'global' && (
                        <div className="mt-2 pt-2 border-t border-emerald-500/20">
                            <p className="text-xs text-emerald-400/70">Promedio {avgLabel}: <span className="font-bold">{formatCurrency(avgDeposit)}</span></p>
                        </div>
                    )}
                </div>

                <div className="bg-rose-900/10 border border-rose-500/20 rounded-lg p-4 flex flex-col justify-between">
                     <div>
                        <p className="text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">Total Retiros</p>
                        <p className="text-2xl font-bold text-rose-100">{formatCurrency(viewTotalWithdrawals)}</p>
                    </div>
                    {viewMode !== 'global' && (
                        <div className="mt-2 pt-2 border-t border-rose-500/20">
                            <p className="text-xs text-rose-400/70">Promedio {avgLabel}: <span className="font-bold">{formatCurrency(avgWithdrawal)}</span></p>
                        </div>
                    )}
                </div>

                <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-4 flex flex-col justify-center">
                    <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">Flujo Neto {viewMode !== 'global' ? `(${avgLabel})` : ''}</p>
                    <p className={`text-3xl font-bold ${viewNet >= 0 ? 'text-blue-100' : 'text-orange-200'}`}>
                        {viewNet >= 0 ? '+' : ''}{formatCurrency(viewNet)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        (Depósitos - Retiros)
                    </p>
                </div>
            </div>

            {/* DETAIL TABLE (Only for period views) */}
            {viewMode !== 'global' && (
                <div className="rounded-lg border border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-900/50 text-xs uppercase font-semibold text-slate-400">
                                <tr>
                                    <th className="px-4 py-3">Periodo</th>
                                    <th className="px-4 py-3 text-right">Depósitos (+)</th>
                                    <th className="px-4 py-3 text-right">Retiros (-)</th>
                                    <th className="px-4 py-3 text-right">Neto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {activePeriods.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-6 text-center text-slate-500 italic">
                                            No hay movimientos de dinero en este desglose.
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((item, idx) => {
                                        const net = item.totalDeposits - item.totalWithdrawals;
                                        return (
                                            <tr key={`${item.periodId}-${idx}`} className="hover:bg-slate-800/50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-slate-200">{item.label}</td>
                                                <td className="px-4 py-3 text-right text-emerald-400">{item.totalDeposits > 0 ? formatCurrency(item.totalDeposits) : '-'}</td>
                                                <td className="px-4 py-3 text-right text-rose-400">{item.totalWithdrawals > 0 ? formatCurrency(item.totalWithdrawals) : '-'}</td>
                                                <td className={`px-4 py-3 text-right font-bold ${net >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                                                    {net !== 0 ? formatCurrency(net) : '-'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                     {/* Pagination Controls */}
                     {activePeriods.length > 0 && (
                        <div className="bg-slate-800 px-4 py-3 border-t border-slate-700 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">Ver</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="bg-slate-900 border border-slate-600 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                </select>
                            </div>
                            
                            <div className="text-xs text-slate-400">
                                {startRange}-{endRange} de {activePeriods.length}
                            </div>

                            <div className="flex gap-1">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`p-1 rounded transition-colors ${
                                    currentPage === 1 
                                        ? 'text-slate-600 cursor-not-allowed' 
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                    }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className={`p-1 rounded transition-colors ${
                                    currentPage === totalPages || totalPages === 0
                                        ? 'text-slate-600 cursor-not-allowed' 
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                    }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>
                     )}
                </div>
            )}
            
            {viewMode === 'global' && (
                 <div className="text-center py-6 text-slate-500 italic bg-slate-900/20 rounded border border-slate-800 border-dashed">
                    Selecciona una pestaña arriba (Diario, Semanal...) para ver el desglose detallado de tus movimientos.
                 </div>
            )}

        </div>
    </Card>
  );
};
