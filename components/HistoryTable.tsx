
import React, { useState, useEffect } from 'react';
import { CalculatedDay, PeriodSummary } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';

type ViewMode = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

interface HistoryTableProps {
  data: CalculatedDay[];
  weekly: PeriodSummary[];
  monthly: PeriodSummary[];
  quarterly: PeriodSummary[];
  yearly: PeriodSummary[];
  onDelete: (id: string) => void;
  onEdit: (entry: CalculatedDay) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ 
  data, weekly, monthly, quarterly, yearly, onDelete, onEdit 
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Tooltip State
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  // --- DATA PREPARATION ---
  
  // Decide which dataset to use based on viewMode
  let rawData: any[] = [];
  switch (viewMode) {
    case 'weekly': rawData = weekly; break;
    case 'monthly': rawData = monthly; break;
    case 'quarterly': rawData = quarterly; break;
    case 'yearly': rawData = yearly; break;
    case 'daily': 
    default: 
      rawData = data; 
      break;
  }

  // Filter Logic
  const filteredData = rawData.filter((item) => {
    if (viewMode === 'daily') {
       const day = item as CalculatedDay;
       if (startDate && day.date < startDate) return false;
       if (endDate && day.date > endDate) return false;
       return true;
    }
    return true; 
  });

  // Calculate total pages
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Reset pagination when data source or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, itemsPerPage, viewMode]);

  // Ensure current page is valid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredData.length, totalPages, currentPage]);

  // Slicing
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  
  // Display range
  const startRange = filteredData.length === 0 ? 0 : indexOfFirstItem + 1;
  const endRange = Math.min(indexOfLastItem, filteredData.length);

  const getPLColor = (val: number) => val >= 0 ? 'text-emerald-400' : 'text-rose-400';

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const tabs: { id: ViewMode; label: string }[] = [
    { id: 'daily', label: 'Diario' },
    { id: 'weekly', label: 'Semanal' },
    { id: 'monthly', label: 'Mensual' },
    { id: 'quarterly', label: 'Trimestral' },
    { id: 'yearly', label: 'Anual' },
  ];

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden flex flex-col min-h-[500px]">
      
      {/* Header Area: Title, Tabs and Filters */}
      <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Histórico del Capital</h3>
          </div>
          
          {/* View Mode Tabs */}
          <div className="flex bg-slate-900 rounded-lg p-1">
             {tabs.map(tab => (
                 <button
                    key={tab.id}
                    onClick={() => setViewMode(tab.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        viewMode === tab.id 
                        ? 'bg-slate-700 text-white shadow' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                 >
                    {tab.label}
                 </button>
             ))}
          </div>
      </div>

      {/* Date Filters (Only show for Daily view) */}
      {viewMode === 'daily' && (
        <div className="bg-slate-900/40 p-3 border-b border-slate-700 flex flex-wrap gap-4 items-end px-6">
            <div>
            <label className="block text-sm text-slate-400 mb-1">Desde</label>
            <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-base text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            </div>
            <div>
            <label className="block text-sm text-slate-400 mb-1">Hasta</label>
            <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-base text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            </div>
            {(startDate || endDate) && (
            <button 
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-sm text-blue-400 hover:text-blue-300 pb-2 underline transition-colors"
            >
                Limpiar filtros
            </button>
            )}
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-lg text-left text-slate-300">
          <thead className="text-sm text-slate-400 uppercase bg-slate-700/50">
            {viewMode === 'daily' ? (
                // --- DAILY COLUMNS ---
                <tr>
                    <th className="px-5 py-4">Fecha</th>
                    <th className="px-5 py-4 text-center">N° Ops</th>
                    <th className="px-5 py-4 text-center">DEPO./RETI.</th>
                    <th className="px-5 py-4 hidden sm:table-cell">Cap. Inicial</th>
                    <th className="px-5 py-4">Cap. Final</th>
                    <th className="px-5 py-4">P/L Diario</th>
                    <th className="px-5 py-4 hidden md:table-cell">P/L Semanal</th>
                    <th className="px-5 py-4 hidden lg:table-cell">P/L Mensual</th>
                    <th className="px-5 py-4 hidden xl:table-cell">P/L Total</th>
                    <th className="px-5 py-4 text-right">Acción</th>
                </tr>
            ) : (
                // --- AGGREGATED COLUMNS ---
                <tr>
                    <th className="px-5 py-4">Periodo</th>
                    <th className="px-5 py-4 text-center text-slate-400">N° Ops</th>
                    <th className="px-5 py-4 text-center">DEPO./RETI.</th>
                    <th className="px-5 py-4 text-slate-400 hidden sm:table-cell">Cap. Inicial</th>
                    <th className="px-5 py-4">Cap. Final</th>
                    <th className="px-5 py-4 text-center">N° Días</th>
                    <th className="px-5 py-4 text-center">Efectividad Días</th>
                    <th className="px-5 py-4 text-right">P/L ($)</th>
                    <th className="px-5 py-4 text-right">P/L (%)</th>
                </tr>
            )}
          </thead>
          <tbody>
            {currentItems.map((item, idx) => {
                // RENDER DAILY ROW
                if (viewMode === 'daily') {
                    const day = item as CalculatedDay;
                    const hasNotes = day.notes && day.notes.trim().length > 0;
                    
                    // Cash Flow Visualization
                    let cashFlowDisplay = <span className="text-slate-600">-</span>;
                    if (day.deposit > 0) {
                        cashFlowDisplay = <span className="text-emerald-400 font-bold" title={`Depósito: +${day.deposit}`}>+{day.deposit}</span>;
                    } else if (day.withdrawal > 0) {
                        cashFlowDisplay = <span className="text-rose-400 font-bold" title={`Retiro: -${day.withdrawal}`}>-{day.withdrawal}</span>;
                    }

                    return (
                        <tr key={day.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                            <td className="px-5 py-4 font-medium text-slate-200 whitespace-nowrap">{day.date}</td>
                            <td className="px-5 py-4 text-center text-slate-400">{day.tradeCount || 0}</td>
                            <td className="px-5 py-4 text-center">
                                {cashFlowDisplay}
                            </td>
                            <td className="px-5 py-4 text-slate-400 hidden sm:table-cell">
                                {formatCurrency(day.initialCapitalDaily)}
                            </td>
                            <td className="px-5 py-4 font-bold text-white">{formatCurrency(day.finalCapital)}</td>
                            <td className={`px-5 py-4 ${getPLColor(day.plDailyDollar)}`}>
                                {formatCurrency(day.plDailyDollar)} <span className="text-sm opacity-75">({formatPercent(day.plDailyPercent)})</span>
                            </td>
                            <td className={`px-5 py-4 hidden md:table-cell ${getPLColor(day.plWeekToDateDollar)}`}>
                                {formatCurrency(day.plWeekToDateDollar)} <span className="text-sm opacity-75">({formatPercent(day.plWeekToDatePercent)})</span>
                            </td>
                            <td className={`px-5 py-4 hidden lg:table-cell ${getPLColor(day.plMonthToDateDollar)}`}>
                                {formatCurrency(day.plMonthToDateDollar)} <span className="text-sm opacity-75">({formatPercent(day.plMonthToDatePercent)})</span>
                            </td>
                            <td className={`px-5 py-4 hidden xl:table-cell ${getPLColor(day.plTotalToDateDollar)}`}>
                                {formatCurrency(day.plTotalToDateDollar)} <span className="text-sm opacity-75">({formatPercent(day.plTotalToDatePercent)})</span>
                            </td>
                            <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-3">
                                    {/* NOTES ICON WITH FIXED TOOLTIP LOGIC */}
                                    {hasNotes && (
                                        <div 
                                            className="flex items-center"
                                            onMouseEnter={(e) => {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setTooltip({
                                                    x: rect.left + (rect.width / 2),
                                                    y: rect.top,
                                                    content: day.notes || ''
                                                });
                                            }}
                                            onMouseLeave={() => setTooltip(null)}
                                        >
                                            <span className="cursor-help text-slate-500 hover:text-amber-400 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </span>
                                        </div>
                                    )}

                                    <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(day);
                                    }}
                                    className="text-slate-500 hover:text-blue-400 transition-colors"
                                    title="Editar registro"
                                    >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    </button>
                                    <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(day.id);
                                    }}
                                    className="text-slate-500 hover:text-rose-500 transition-colors"
                                    title="Eliminar registro"
                                    >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    );
                } else {
                    // RENDER SUMMARY ROW
                    const summary = item as PeriodSummary;
                    const netFlow = summary.totalDeposits - summary.totalWithdrawals;
                    
                    // Cash Flow Display Logic
                    let flowDisplay = <span className="text-slate-600">-</span>;
                    if (netFlow > 0) flowDisplay = <span className="text-emerald-400 font-bold">+{formatCurrency(netFlow)}</span>;
                    if (netFlow < 0) flowDisplay = <span className="text-rose-400 font-bold">{formatCurrency(netFlow)}</span>;

                    return (
                        <tr key={summary.periodId} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                            <td className="px-5 py-5 font-medium text-slate-200">{summary.label}</td>
                            <td className="px-5 py-5 text-center text-slate-400">{summary.totalOperations}</td>
                            <td className="px-5 py-5 text-center">{flowDisplay}</td>
                            <td className="px-5 py-5 text-slate-400 hidden sm:table-cell">{formatCurrency(summary.startCapital)}</td>
                            <td className="px-5 py-5 font-bold text-white">{formatCurrency(summary.endCapital)}</td>
                            <td className="px-5 py-5 text-center text-slate-400">{summary.tradeCount}</td>
                            <td className="px-5 py-5 text-center">
                                <span className="px-3 py-1.5 rounded bg-slate-800 text-slate-200 border border-slate-600 text-sm">
                                    {formatPercent(summary.winRate)}
                                </span>
                            </td>
                            <td className={`px-5 py-5 text-right font-semibold ${getPLColor(summary.plDollar)}`}>
                                {formatCurrency(summary.plDollar)}
                            </td>
                            <td className={`px-5 py-5 text-right ${getPLColor(summary.plPercent)}`}>
                                {formatPercent(summary.plPercent)}
                            </td>
                        </tr>
                    )
                }
            })}
            
            {/* Empty State */}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={viewMode === 'daily' ? 10 : 9} className="px-6 py-8 text-center text-slate-500 italic text-lg">
                  {rawData.length === 0 
                    ? "No hay registros disponibles." 
                    : "No se encontraron registros en el filtro seleccionado."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredData.length > 0 && (
        <div className="bg-slate-800 border-t border-slate-700 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">Mostrar</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-600 text-slate-200 text-base rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-slate-400">filas</span>
          </div>
          
          <div className="text-sm text-slate-400 text-center">
            Mostrando <span className="font-medium text-slate-200">{startRange}</span> - <span className="font-medium text-slate-200">{endRange}</span> de <span className="font-medium text-slate-200">{filteredData.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded transition-colors ${
                  currentPage === 1 
                    ? 'text-slate-600 cursor-not-allowed' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`p-2 rounded transition-colors ${
                  currentPage === totalPages || totalPages === 0
                    ? 'text-slate-600 cursor-not-allowed' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIXED TOOLTIP RENDERED OUTSIDE OF TABLE FLOW */}
      {tooltip && (
          <div 
            className="fixed z-[100] p-4 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl text-sm text-slate-200 pointer-events-none max-w-sm animate-in fade-in zoom-in duration-150"
            style={{
                top: tooltip.y - 12, 
                left: tooltip.x,
                transform: 'translate(-90%, -100%)' // Position above and to the left of the cursor
            }}
          >
            <p className="font-bold text-amber-400 text-xs mb-1 uppercase tracking-wider">Notas del día</p>
            <div className="leading-relaxed text-xs whitespace-pre-wrap">{tooltip.content}</div>
            {/* Arrow */}
            <div className="absolute top-full right-4 -mt-1 border-8 border-transparent border-t-slate-600"></div>
          </div>
      )}
    </div>
  );
};
